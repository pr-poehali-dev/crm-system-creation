"""API для управления партнёрами: получение списка, создание, обновление и удаление партнёров"""
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
        
        # GET - получить всех партнёров
        if method == 'GET':
            cursor.execute("""
                SELECT id, partner_id, type, company_name, contact_person, 
                       phone, email, telegram_username, telegram_link,
                       legal_name, inn, kpp, notes, created_at
                FROM partners
                ORDER BY created_at DESC
            """)
            
            partners = []
            for row in cursor.fetchall():
                partners.append({
                    'id': row['id'],
                    'partner_id': row['partner_id'],
                    'type': row['type'],
                    'company_name': row['company_name'],
                    'contact_person': row['contact_person'],
                    'phone': row['phone'],
                    'email': row['email'],
                    'telegram_username': row['telegram_username'],
                    'telegram_link': row['telegram_link'],
                    'legal_name': row['legal_name'],
                    'inn': row['inn'],
                    'kpp': row['kpp'],
                    'notes': row['notes'],
                    'created_at': row['created_at'].isoformat() if row['created_at'] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'partners': partners}),
                'isBase64Encoded': False
            }
        
        # POST - создать нового партнёра
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            # Генерация partner_id (например, P-001, P-002)
            cursor.execute("""
                SELECT COALESCE(MAX(CAST(SUBSTRING(partner_id FROM 3) AS INTEGER)), 0) + 1
                FROM partners
                WHERE partner_id LIKE 'P-%'
            """)
            next_number = cursor.fetchone()['coalesce']
            partner_id = f"P-{next_number:03d}"
            
            cursor.execute("""
                INSERT INTO partners 
                (partner_id, type, company_name, contact_person, phone, email, 
                 telegram_username, telegram_link, legal_name, inn, kpp, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, partner_id, type, company_name, contact_person, 
                          phone, email, created_at
            """, (
                partner_id,
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
                body.get('notes')
            ))
            
            row = cursor.fetchone()
            new_partner = {
                'id': row['id'],
                'partner_id': row['partner_id'],
                'type': row['type'],
                'company_name': row['company_name'],
                'contact_person': row['contact_person'],
                'phone': row['phone'],
                'email': row['email'],
                'created_at': row['created_at'].isoformat() if row['created_at'] else None
            }
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'partner': new_partner}),
                'isBase64Encoded': False
            }
        
        # PUT - обновить партнёра
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            partner_id = body.get('id')
            
            cursor.execute("""
                UPDATE partners
                SET type = %s, company_name = %s, contact_person = %s,
                    phone = %s, email = %s, telegram_username = %s,
                    telegram_link = %s, legal_name = %s, inn = %s,
                    kpp = %s, notes = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, partner_id, type, company_name, contact_person,
                          phone, email, updated_at
            """, (
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
                body.get('notes'),
                partner_id
            ))
            
            row = cursor.fetchone()
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Partner not found'}),
                    'isBase64Encoded': False
                }
            
            updated_partner = {
                'id': row['id'],
                'partner_id': row['partner_id'],
                'type': row['type'],
                'company_name': row['company_name'],
                'contact_person': row['contact_person'],
                'phone': row['phone'],
                'email': row['email'],
                'updated_at': row['updated_at'].isoformat() if row['updated_at'] else None
            }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'partner': updated_partner}),
                'isBase64Encoded': False
            }
        
        # DELETE - удалить партнёра
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {})
            partner_id = query_params.get('id')
            
            cursor.execute("""
                DELETE FROM partners
                WHERE id = %s
            """, (partner_id,))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True}),
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
