import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def handler(event, context):
    '''Универсальный API для работы с данными CRM (лиды, партнёры, выдачи авто, финансы)'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return error_response('DATABASE_URL not configured', 500)
        
        conn = psycopg2.connect(dsn)
        
        path_params = event.get('pathParams', {})
        query_params = event.get('queryStringParameters', {})
        entity_type = query_params.get('type', 'leads')
        
        if method == 'GET':
            result = handle_get(conn, entity_type, path_params, query_params)
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            result = handle_post(conn, entity_type, body)
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            result = handle_put(conn, entity_type, body, path_params)
        elif method == 'DELETE':
            result = handle_delete(conn, entity_type, path_params)
        else:
            result = error_response('Method not allowed', 405)
        
        conn.close()
        return result
        
    except Exception as e:
        return error_response(str(e), 500)

def handle_get(conn, entity_type, path_params, query_params):
    '''Получение данных'''
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    record_id = path_params.get('id')
    
    if entity_type == 'leads':
        if record_id:
            cursor.execute('SELECT * FROM leads WHERE id = %s', (record_id,))
            data = cursor.fetchone()
        else:
            cursor.execute('SELECT * FROM leads ORDER BY created_at DESC')
            data = cursor.fetchall()
    
    elif entity_type == 'partners':
        if record_id:
            cursor.execute('SELECT * FROM partners WHERE id = %s', (record_id,))
            partner = cursor.fetchone()
            if partner:
                cursor.execute('SELECT * FROM partner_vehicles WHERE partner_id = %s', (record_id,))
                partner['vehicles'] = cursor.fetchall()
                cursor.execute('SELECT * FROM partner_services WHERE partner_id = %s', (record_id,))
                partner['services'] = cursor.fetchall()
            data = partner
        else:
            cursor.execute('SELECT * FROM partners ORDER BY created_at DESC')
            partners = cursor.fetchall()
            for partner in partners:
                cursor.execute('SELECT * FROM partner_vehicles WHERE partner_id = %s', (partner['id'],))
                partner['vehicles'] = cursor.fetchall()
                cursor.execute('SELECT * FROM partner_services WHERE partner_id = %s', (partner['id'],))
                partner['services'] = cursor.fetchall()
            data = partners
    
    elif entity_type == 'vehicle_handovers':
        vehicle_id = query_params.get('vehicle_id')
        if vehicle_id:
            cursor.execute('''
                SELECT vh.*, f.model as vehicle_model, f.license_plate
                FROM vehicle_handovers vh
                LEFT JOIN fleet f ON vh.vehicle_id = f.id
                WHERE vh.vehicle_id = %s
                ORDER BY vh.handover_date DESC, vh.handover_time DESC
            ''', (vehicle_id,))
            data = cursor.fetchall()
        elif record_id:
            cursor.execute('SELECT * FROM vehicle_handovers WHERE id = %s', (record_id,))
            data = cursor.fetchone()
        else:
            cursor.execute('''
                SELECT vh.*, f.model as vehicle_model, f.license_plate
                FROM vehicle_handovers vh
                LEFT JOIN fleet f ON vh.vehicle_id = f.id
                ORDER BY vh.handover_date DESC, vh.handover_time DESC
            ''')
            data = cursor.fetchall()
    
    elif entity_type == 'finances':
        category = query_params.get('category')
        if category:
            cursor.execute('SELECT * FROM finance_operations WHERE category = %s ORDER BY date DESC', (category,))
        elif record_id:
            cursor.execute('SELECT * FROM finance_operations WHERE id = %s', (record_id,))
            data = cursor.fetchone()
        else:
            cursor.execute('SELECT * FROM finance_operations ORDER BY date DESC')
        data = cursor.fetchall() if not record_id else data
    
    else:
        return error_response(f'Unknown entity type: {entity_type}', 400)
    
    cursor.close()
    return success_response(data)

def handle_post(conn, entity_type, body):
    '''Создание записи'''
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    if entity_type == 'leads':
        cursor.execute('''
            INSERT INTO leads (lead_id, client_name, phone, email, source, status, vehicle_type, rental_period, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        ''', (
            body.get('lead_id'),
            body.get('client_name'),
            body.get('phone'),
            body.get('email'),
            body.get('source'),
            body.get('status', 'new'),
            body.get('vehicle_type'),
            body.get('rental_period'),
            body.get('notes')
        ))
    
    elif entity_type == 'partners':
        cursor.execute('''
            INSERT INTO partners (
                partner_id, type, company_name, contact_person, phone, email,
                telegram_username, telegram_link, legal_name, inn, kpp, legal_address,
                bank_name, bank_account, correspondent_account, bik,
                passport_series, passport_number, passport_issued_by, passport_issued_date, notes
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        ''', (
            body.get('partner_id'),
            body.get('type'),
            body.get('company_name'),
            body.get('contact_person'),
            body.get('phone'),
            body.get('email'),
            body.get('telegram_username'),
            body.get('telegram_link'),
            body.get('legal_name'),
            body.get('inn'),
            body.get('kpp'),
            body.get('legal_address'),
            body.get('bank_name'),
            body.get('bank_account'),
            body.get('correspondent_account'),
            body.get('bik'),
            body.get('passport_series'),
            body.get('passport_number'),
            body.get('passport_issued_by'),
            body.get('passport_issued_date'),
            body.get('notes')
        ))
        partner = cursor.fetchone()
        partner_id = partner['id']
        
        for vehicle in body.get('vehicles', []):
            cursor.execute('''
                INSERT INTO partner_vehicles (partner_id, model, license_plate, daily_rate, notes)
                VALUES (%s, %s, %s, %s, %s)
            ''', (partner_id, vehicle['model'], vehicle['license_plate'], vehicle['daily_rate'], vehicle.get('notes')))
        
        for service in body.get('services', []):
            cursor.execute('''
                INSERT INTO partner_services (partner_id, name, price, unit, notes)
                VALUES (%s, %s, %s, %s, %s)
            ''', (partner_id, service['name'], service['price'], service['unit'], service.get('notes')))
        
        conn.commit()
        return success_response(partner)
    
    elif entity_type == 'vehicle_handovers':
        cursor.execute('''
            INSERT INTO vehicle_handovers (
                handover_id, vehicle_id, booking_id, type, handover_date, handover_time,
                odometer, fuel_level, transponder_needed, transponder_number,
                deposit_amount, rental_amount, rental_payment_method, rental_receipt_url,
                damages, notes, custom_fields, created_by
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        ''', (
            body.get('handover_id'),
            body.get('vehicle_id'),
            body.get('booking_id'),
            body.get('type'),
            body.get('handover_date'),
            body.get('handover_time'),
            body.get('odometer'),
            body.get('fuel_level'),
            body.get('transponder_needed', False),
            body.get('transponder_number'),
            body.get('deposit_amount', 0),
            body.get('rental_amount', 0),
            body.get('rental_payment_method'),
            body.get('rental_receipt_url'),
            body.get('damages'),
            body.get('notes'),
            json.dumps(body.get('custom_fields', {})),
            body.get('created_by')
        ))
    
    elif entity_type == 'finances':
        cursor.execute('''
            INSERT INTO finance_operations (
                operation_id, booking_id, date, client_name, type, category,
                method, amount, status, document_url, document_name, notes
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        ''', (
            body.get('operation_id'),
            body.get('booking_id'),
            body.get('date', datetime.now().isoformat()),
            body.get('client_name'),
            body.get('type'),
            body.get('category', 'payment'),
            body.get('method'),
            body.get('amount'),
            body.get('status', 'completed'),
            body.get('document_url'),
            body.get('document_name'),
            body.get('notes')
        ))
    
    else:
        return error_response(f'Unknown entity type: {entity_type}', 400)
    
    data = cursor.fetchone()
    conn.commit()
    cursor.close()
    return success_response(data)

def handle_put(conn, entity_type, body, path_params):
    '''Обновление записи'''
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    record_id = path_params.get('id') or body.get('id')
    
    if not record_id:
        return error_response('ID is required for update', 400)
    
    if entity_type == 'leads':
        cursor.execute('''
            UPDATE leads SET
                client_name = %s, phone = %s, email = %s, source = %s,
                status = %s, vehicle_type = %s, rental_period = %s, notes = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING *
        ''', (
            body.get('client_name'),
            body.get('phone'),
            body.get('email'),
            body.get('source'),
            body.get('status'),
            body.get('vehicle_type'),
            body.get('rental_period'),
            body.get('notes'),
            record_id
        ))
    
    elif entity_type == 'partners':
        cursor.execute('''
            UPDATE partners SET
                type = %s, company_name = %s, contact_person = %s, phone = %s, email = %s,
                telegram_username = %s, telegram_link = %s, legal_name = %s, inn = %s, kpp = %s,
                legal_address = %s, bank_name = %s, bank_account = %s, correspondent_account = %s,
                bik = %s, passport_series = %s, passport_number = %s, passport_issued_by = %s,
                passport_issued_date = %s, notes = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING *
        ''', (
            body.get('type'),
            body.get('company_name'),
            body.get('contact_person'),
            body.get('phone'),
            body.get('email'),
            body.get('telegram_username'),
            body.get('telegram_link'),
            body.get('legal_name'),
            body.get('inn'),
            body.get('kpp'),
            body.get('legal_address'),
            body.get('bank_name'),
            body.get('bank_account'),
            body.get('correspondent_account'),
            body.get('bik'),
            body.get('passport_series'),
            body.get('passport_number'),
            body.get('passport_issued_by'),
            body.get('passport_issued_date'),
            body.get('notes'),
            record_id
        ))
    
    elif entity_type == 'finances':
        cursor.execute('''
            UPDATE finance_operations SET
                client_name = %s, type = %s, method = %s, amount = %s,
                status = %s, notes = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING *
        ''', (
            body.get('client_name'),
            body.get('type'),
            body.get('method'),
            body.get('amount'),
            body.get('status'),
            body.get('notes'),
            record_id
        ))
    
    else:
        return error_response(f'Update not supported for: {entity_type}', 400)
    
    data = cursor.fetchone()
    conn.commit()
    cursor.close()
    return success_response(data)

def handle_delete(conn, entity_type, path_params):
    '''Удаление записи (мягкое, через статус)'''
    cursor = conn.cursor()
    record_id = path_params.get('id')
    
    if not record_id:
        return error_response('ID is required for delete', 400)
    
    if entity_type in ['leads', 'partners', 'finances']:
        table_map = {
            'leads': 'leads',
            'partners': 'partners',
            'finances': 'finance_operations'
        }
        table = table_map[entity_type]
        cursor.execute(f'UPDATE {table} SET updated_at = CURRENT_TIMESTAMP WHERE id = %s', (record_id,))
        conn.commit()
    
    cursor.close()
    return success_response({'deleted': True, 'id': record_id})

def success_response(data):
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data, default=str),
        'isBase64Encoded': False
    }

def error_response(message, status_code=500):
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }
