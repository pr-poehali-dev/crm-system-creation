"""
API для управления автопарком
Добавление, редактирование, удаление и получение информации об автомобилях
"""

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

SCHEMA = 't_p81623955_crm_system_creation'

def get_db_connection():
    """Создает подключение к базе данных"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor, options=f'-c search_path={SCHEMA}')

def handler(event, context):
    method = event.get('httpMethod', 'GET') 
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'GET':
            vehicle_id = event.get('queryStringParameters', {}).get('id')
            
            if vehicle_id:
                cur.execute('''
                    SELECT id, branch_id, model, license_plate, vin, year, color, seats, category,
                           status, current_location, insurance_expires, tech_inspection_expires,
                           osago_number, kasko_number, last_service_date, next_service_date,
                           last_service_km, next_service_km, current_km, purchase_price,
                           rental_price_per_day, rental_price_per_km, sublease_cost, notes, is_active,
                           created_at, updated_at
                    FROM fleet
                    WHERE id = %s
                ''', (vehicle_id,))
                row = cur.fetchone()
                
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Vehicle not found'}),
                        'isBase64Encoded': False
                    }
                
                vehicle = {
                    'id': row[0], 'branch_id': row[1], 'model': row[2], 'license_plate': row[3],
                    'vin': row[4], 'year': row[5], 'color': row[6], 'seats': row[7],
                    'category': row[8], 'status': row[9], 'current_location': row[10],
                    'insurance_expires': str(row[11]) if row[11] else None,
                    'tech_inspection_expires': str(row[12]) if row[12] else None,
                    'osago_number': row[13], 'kasko_number': row[14],
                    'last_service_date': str(row[15]) if row[15] else None,
                    'next_service_date': str(row[16]) if row[16] else None,
                    'last_service_km': row[17], 'next_service_km': row[18], 'current_km': row[19],
                    'purchase_price': float(row[20]) if row[20] else None,
                    'rental_price_per_day': float(row[21]) if row[21] else None,
                    'rental_price_per_km': float(row[22]) if row[22] else None,
                    'sublease_cost': float(row[23]) if row[23] else 0.0,
                    'notes': row[24], 'is_active': row[25],
                    'created_at': str(row[26]), 'updated_at': str(row[27]) if row[27] else None
                }
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps(vehicle),
                    'isBase64Encoded': False
                }
            
            else:
                cur.execute('''
                    SELECT id, model, license_plate, status, current_location, next_service_date
                    FROM fleet
                    WHERE is_active = true
                    ORDER BY model, license_plate
                ''')
                rows = cur.fetchall()
                
                vehicles = []
                for row in rows:
                    vehicles.append({
                        'id': row[0],
                        'model': row[1],
                        'license_plate': row[2],
                        'status': row[3],
                        'current_location': row[4],
                        'next_service_date': str(row[5]) if row[5] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'vehicles': vehicles, 'total': len(vehicles)}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            data = json.loads(event.get('body', '{}'))
            vehicle_id = data.get('id')
            
            if not vehicle_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Vehicle ID is required'}),
                    'isBase64Encoded': False
                }
            
            update_fields = []
            params = []
            
            field_mappings = {
                'model': 'model', 'license_plate': 'license_plate', 'vin': 'vin',
                'year': 'year', 'color': 'color', 'seats': 'seats', 'category': 'category',
                'status': 'status', 'current_location': 'current_location',
                'insurance_expires': 'insurance_expires', 'tech_inspection_expires': 'tech_inspection_expires',
                'osago_number': 'osago_number', 'kasko_number': 'kasko_number',
                'last_service_date': 'last_service_date', 'next_service_date': 'next_service_date',
                'last_service_km': 'last_service_km', 'next_service_km': 'next_service_km',
                'current_km': 'current_km', 'purchase_price': 'purchase_price',
                'rental_price_per_day': 'rental_price_per_day', 'rental_price_per_km': 'rental_price_per_km',
                'sublease_cost': 'sublease_cost', 'notes': 'notes'
            }
            
            for json_key, db_field in field_mappings.items():
                if json_key in data:
                    update_fields.append(f'{db_field} = %s')
                    params.append(data[json_key])
            
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            update_fields.append('updated_at = CURRENT_TIMESTAMP')
            params.append(vehicle_id)
            
            query = f'''
                UPDATE fleet
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING id
            '''
            
            cur.execute(query, params)
            updated_id = cur.fetchone()
            
            if not updated_id:
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Vehicle not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'id': updated_id[0], 'message': 'Vehicle updated successfully'}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            data = json.loads(event.get('body', '{}'))
            
            action = event.get('queryStringParameters', {}).get('action')
            
            if action == 'handover':
                cur.execute('''
                    INSERT INTO vehicle_handovers (
                        handover_id, vehicle_id, booking_id, type, handover_date, handover_time,
                        odometer, fuel_level, transponder_needed, transponder_number,
                        deposit_amount, rental_amount, rental_payment_method, rental_receipt_url,
                        damages, notes, custom_fields, created_by
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (
                    data.get('handover_id'),
                    data.get('vehicle_id'),
                    data.get('booking_id'),
                    data.get('type'),
                    data.get('handover_date'),
                    data.get('handover_time'),
                    data.get('odometer'),
                    data.get('fuel_level'),
                    data.get('transponder_needed', False),
                    data.get('transponder_number'),
                    data.get('deposit_amount', 0),
                    data.get('rental_amount', 0),
                    data.get('rental_payment_method'),
                    data.get('rental_receipt_url'),
                    data.get('damages'),
                    data.get('notes'),
                    json.dumps(data.get('custom_fields', {})),
                    data.get('created_by')
                ))
                
                handover_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'id': handover_id, 'message': 'Handover recorded successfully'}),
                    'isBase64Encoded': False
                }
            
            if action == 'handover_history':
                vehicle_id = data.get('vehicle_id')
                if not vehicle_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'vehicle_id is required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute('''
                    SELECT id, handover_id, type, handover_date, handover_time,
                           odometer, fuel_level, deposit_amount, rental_amount,
                           rental_payment_method, transponder_number, notes, created_at
                    FROM vehicle_handovers
                    WHERE vehicle_id = %s
                    ORDER BY handover_date DESC, handover_time DESC
                ''', (vehicle_id,))
                
                rows = cur.fetchall()
                history = []
                for row in rows:
                    history.append({
                        'id': row[0],
                        'handover_id': row[1],
                        'type': row[2],
                        'handover_date': str(row[3]),
                        'handover_time': str(row[4]),
                        'odometer': row[5],
                        'fuel_level': row[6],
                        'deposit_amount': float(row[7]) if row[7] else 0,
                        'rental_amount': float(row[8]) if row[8] else 0,
                        'rental_payment_method': row[9],
                        'transponder_number': row[10],
                        'notes': row[11],
                        'created_at': str(row[12])
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'handovers': history, 'total': len(history)}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                INSERT INTO fleet (
                    branch_id, model, license_plate, vin, year, color, seats, category,
                    status, current_location, insurance_expires, tech_inspection_expires,
                    osago_number, kasko_number, last_service_date, next_service_date,
                    last_service_km, next_service_km, current_km, purchase_price,
                    rental_price_per_day, rental_price_per_km, sublease_cost, notes, is_active, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                data.get('branch_id'), data.get('model'), data.get('license_plate'),
                data.get('vin'), data.get('year'), data.get('color'), data.get('seats'),
                data.get('category'), data.get('status', 'Свободен'), data.get('current_location'),
                data.get('insurance_expires'), data.get('tech_inspection_expires'),
                data.get('osago_number'), data.get('kasko_number'), data.get('last_service_date'),
                data.get('next_service_date'), data.get('last_service_km'), data.get('next_service_km'),
                data.get('current_km', 0), data.get('purchase_price'), data.get('rental_price_per_day'),
                data.get('rental_price_per_km'), data.get('sublease_cost', 0), data.get('notes'), True, datetime.now()
            ))
            
            vehicle_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'id': vehicle_id, 'message': 'Vehicle created successfully'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            data = json.loads(event.get('body', '{}'))
            vehicle_id = data.get('id')
            
            if not vehicle_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Vehicle ID is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                UPDATE fleet
                SET model = %s, license_plate = %s, status = %s, current_location = %s,
                    current_km = %s, rental_price_per_day = %s, rental_price_per_km = %s,
                    sublease_cost = %s, notes = %s, updated_at = %s
                WHERE id = %s
            ''', (
                data.get('model'), data.get('license_plate'), data.get('status'),
                data.get('current_location'), data.get('current_km'), 
                data.get('rental_price_per_day'), data.get('rental_price_per_km'),
                data.get('sublease_cost', 0), data.get('notes'),
                datetime.now(), vehicle_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'message': 'Vehicle updated successfully'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if conn:
            conn.close()