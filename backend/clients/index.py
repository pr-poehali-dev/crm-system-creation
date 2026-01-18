"""API для управления клиентами: получение списка, создание, обновление и удаление клиентов"""
import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token'
            },
            'body': ''
        }
    
    try:
        # Подключение к БД
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # GET - получить всех клиентов
        if method == 'GET':
            cursor.execute("""
                SELECT id, name, phone, email, company, telegram, whatsapp, 
                       city, balance, total_spent, orders_count, rating, 
                       source, is_blacklist, notes, created_at, birth_date,
                       passport_series, passport_number, passport_issued_by, passport_issued_date,
                       address, driver_license_series, driver_license_number, driver_license_issued_date
                FROM t_p81623955_crm_system_creation.clients
                ORDER BY created_at DESC
            """)
            
            clients = []
            for row in cursor.fetchall():
                clients.append({
                    'id': row[0],
                    'name': row[1],
                    'phone': row[2],
                    'email': row[3],
                    'company': row[4],
                    'telegram': row[5],
                    'whatsapp': row[6],
                    'city': row[7],
                    'balance': float(row[8]) if row[8] else 0,
                    'total_spent': float(row[9]) if row[9] else 0,
                    'orders_count': row[10] or 0,
                    'rating': float(row[11]) if row[11] else 5.0,
                    'source': row[12],
                    'is_blacklist': row[13] or False,
                    'notes': row[14],
                    'created_at': row[15].isoformat() if row[15] else None,
                    'birth_date': row[16].isoformat() if row[16] else None,
                    'passport_series': row[17],
                    'passport_number': row[18],
                    'passport_issued_by': row[19],
                    'passport_issued_date': row[20].isoformat() if row[20] else None,
                    'address': row[21],
                    'driver_license_series': row[22],
                    'driver_license_number': row[23],
                    'driver_license_issued_date': row[24].isoformat() if row[24] else None
                })
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'clients': clients})
            }
        
        # POST - создать нового клиента
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute("""
                INSERT INTO t_p81623955_crm_system_creation.clients 
                (name, phone, email, company, telegram, whatsapp, city, notes, source, birth_date,
                 passport_series, passport_number, passport_issued_by, passport_issued_date,
                 address, driver_license_series, driver_license_number, driver_license_issued_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, name, phone, email, company, telegram, whatsapp, 
                          city, balance, created_at, birth_date
            """, (
                body.get('name'),
                body.get('phone'),
                body.get('email'),
                body.get('company'),
                body.get('telegram'),
                body.get('whatsapp'),
                body.get('city'),
                body.get('notes'),
                body.get('source', 'manual'),
                body.get('birth_date'),
                body.get('passport_series'),
                body.get('passport_number'),
                body.get('passport_issued_by'),
                body.get('passport_issued_date'),
                body.get('address'),
                body.get('driver_license_series'),
                body.get('driver_license_number'),
                body.get('driver_license_issued_date')
            ))
            
            row = cursor.fetchone()
            new_client = {
                'id': row[0],
                'name': row[1],
                'phone': row[2],
                'email': row[3],
                'company': row[4],
                'telegram': row[5],
                'whatsapp': row[6],
                'city': row[7],
                'balance': float(row[8]) if row[8] else 0,
                'created_at': row[9].isoformat() if row[9] else None,
                'birth_date': row[10].isoformat() if row[10] else None
            }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'client': new_client})
            }
        
        # PUT - обновить клиента
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            client_id = body.get('id')
            
            cursor.execute("""
                UPDATE t_p81623955_crm_system_creation.clients
                SET name = %s, phone = %s, email = %s, company = %s,
                    telegram = %s, whatsapp = %s, city = %s, notes = %s,
                    is_blacklist = %s, birth_date = %s,
                    passport_series = %s, passport_number = %s, passport_issued_by = %s, passport_issued_date = %s,
                    address = %s, driver_license_series = %s, driver_license_number = %s, driver_license_issued_date = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, name, phone, email, company, telegram, whatsapp,
                          city, balance, is_blacklist, updated_at, birth_date
            """, (
                body.get('name'),
                body.get('phone'),
                body.get('email'),
                body.get('company'),
                body.get('telegram'),
                body.get('whatsapp'),
                body.get('city'),
                body.get('notes'),
                body.get('is_blacklist', False),
                body.get('birth_date'),
                body.get('passport_series'),
                body.get('passport_number'),
                body.get('passport_issued_by'),
                body.get('passport_issued_date'),
                body.get('address'),
                body.get('driver_license_series'),
                body.get('driver_license_number'),
                body.get('driver_license_issued_date'),
                client_id
            ))
            
            row = cursor.fetchone()
            if not row:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Client not found'})
                }
            
            updated_client = {
                'id': row[0],
                'name': row[1],
                'phone': row[2],
                'email': row[3],
                'company': row[4],
                'telegram': row[5],
                'whatsapp': row[6],
                'city': row[7],
                'balance': float(row[8]) if row[8] else 0,
                'is_blacklist': row[9],
                'updated_at': row[10].isoformat() if row[10] else None,
                'birth_date': row[11].isoformat() if row[11] else None
            }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'client': updated_client})
            }
        
        # DELETE - удалить клиента
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {})
            client_id = query_params.get('id')
            
            if not client_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing client id'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute("""
                DELETE FROM t_p81623955_crm_system_creation.clients
                WHERE id = %s
                RETURNING id, name
            """, (client_id,))
            
            row = cursor.fetchone()
            if not row:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Client not found'}),
                    'isBase64Encoded': False
                }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': f'Client {row[1]} deleted successfully'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
            
    except Exception as e:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }