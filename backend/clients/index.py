"""API для управления клиентами: получение списка, создание, обновление и удаление клиентов"""
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
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # GET - получить всех клиентов
        if method == 'GET':
            cursor.execute("""
                SELECT id, name, phone, email, company, telegram, whatsapp, 
                       city, balance, total_spent, orders_count, rating, 
                       source, is_blacklist, notes, created_at, birth_date,
                       passport_series, passport_number, passport_issued_by, passport_issued_date,
                       address, driver_license_series, driver_license_number, driver_license_issued_date
                FROM clients
                WHERE (created_at IS NULL OR EXTRACT(YEAR FROM created_at) < 2100)
                  AND (birth_date IS NULL OR EXTRACT(YEAR FROM birth_date) < 2100)
                  AND (passport_issued_date IS NULL OR EXTRACT(YEAR FROM passport_issued_date) < 2100)
                  AND (driver_license_issued_date IS NULL OR EXTRACT(YEAR FROM driver_license_issued_date) < 2100)
                ORDER BY created_at DESC
            """)
            
            clients = []
            for row in cursor.fetchall():
                clients.append({
                    'id': row['id'],
                    'name': row['name'],
                    'phone': row['phone'],
                    'email': row['email'],
                    'company': row['company'],
                    'telegram': row['telegram'],
                    'whatsapp': row['whatsapp'],
                    'city': row['city'],
                    'balance': float(row['balance']) if row['balance'] else 0,
                    'total_spent': float(row['total_spent']) if row['total_spent'] else 0,
                    'orders_count': row['orders_count'] or 0,
                    'rating': float(row['rating']) if row['rating'] else 5.0,
                    'source': row['source'],
                    'is_blacklist': row['is_blacklist'] or False,
                    'notes': row['notes'],
                    'created_at': row['created_at'].isoformat() if row['created_at'] else None,
                    'birth_date': row['birth_date'].isoformat() if row['birth_date'] else None,
                    'passport_series': row['passport_series'],
                    'passport_number': row['passport_number'],
                    'passport_issued_by': row['passport_issued_by'],
                    'passport_issued_date': row['passport_issued_date'].isoformat() if row['passport_issued_date'] else None,
                    'address': row['address'],
                    'driver_license_series': row['driver_license_series'],
                    'driver_license_number': row['driver_license_number'],
                    'driver_license_issued_date': row['driver_license_issued_date'].isoformat() if row['driver_license_issued_date'] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'clients': clients}),
                'isBase64Encoded': False
            }
        
        # POST - создать нового клиента
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute("""
                INSERT INTO clients 
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
            
            conn.commit()
            row = cursor.fetchone()
            new_client = {
                'id': row['id'],
                'name': row['name'],
                'phone': row['phone'],
                'email': row['email'],
                'company': row['company'],
                'telegram': row['telegram'],
                'whatsapp': row['whatsapp'],
                'city': row['city'],
                'balance': float(row['balance']) if row['balance'] else 0,
                'created_at': row['created_at'].isoformat() if row['created_at'] else None,
                'birth_date': row['birth_date'].isoformat() if row['birth_date'] else None
            }
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'client': new_client}),
                'isBase64Encoded': False
            }
        
        # PUT - обновить клиента
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            client_id = body.get('id')
            
            cursor.execute("""
                UPDATE clients
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
            
            conn.commit()
            row = cursor.fetchone()
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Client not found'}),
                    'isBase64Encoded': False
                }
            
            updated_client = {
                'id': row['id'],
                'name': row['name'],
                'phone': row['phone'],
                'email': row['email'],
                'company': row['company'],
                'telegram': row['telegram'],
                'whatsapp': row['whatsapp'],
                'city': row['city'],
                'balance': float(row['balance']) if row['balance'] else 0,
                'is_blacklist': row['is_blacklist'],
                'updated_at': row['updated_at'].isoformat() if row['updated_at'] else None,
                'birth_date': row['birth_date'].isoformat() if row['birth_date'] else None
            }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'client': updated_client}),
                'isBase64Encoded': False
            }
        
        # DELETE - удалить клиента
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {})
            client_id = query_params.get('id')
            
            if not client_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing client id'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute("""
                DELETE FROM clients
                WHERE id = %s
                RETURNING id, name
            """, (client_id,))
            
            conn.commit()
            row = cursor.fetchone()
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Client not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': f'Client {row["name"]} deleted successfully'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if conn:
            conn.close()