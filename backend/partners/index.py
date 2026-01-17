"""API для управления партнёрами: получение списка, создание, обновление и удаление партнёров"""
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
        
        # GET - получить всех партнёров
        if method == 'GET':
            cursor.execute("""
                SELECT id, partner_id, type, company_name, contact_person, 
                       phone, email, telegram_username, telegram_link,
                       legal_name, inn, kpp, notes, created_at
                FROM t_p81623955_crm_system_creation.partners
                ORDER BY created_at DESC
            """)
            
            partners = []
            for row in cursor.fetchall():
                partners.append({
                    'id': row[0],
                    'partner_id': row[1],
                    'type': row[2],
                    'company_name': row[3],
                    'contact_person': row[4],
                    'phone': row[5],
                    'email': row[6],
                    'telegram_username': row[7],
                    'telegram_link': row[8],
                    'legal_name': row[9],
                    'inn': row[10],
                    'kpp': row[11],
                    'notes': row[12],
                    'created_at': row[13].isoformat() if row[13] else None
                })
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'partners': partners})
            }
        
        # POST - создать нового партнёра
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            # Генерация partner_id (например, P-001, P-002)
            cursor.execute("""
                SELECT COALESCE(MAX(CAST(SUBSTRING(partner_id FROM 3) AS INTEGER)), 0) + 1
                FROM t_p81623955_crm_system_creation.partners
                WHERE partner_id LIKE 'P-%'
            """)
            next_number = cursor.fetchone()[0]
            partner_id = f"P-{next_number:03d}"
            
            cursor.execute("""
                INSERT INTO t_p81623955_crm_system_creation.partners 
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
                'id': row[0],
                'partner_id': row[1],
                'type': row[2],
                'company_name': row[3],
                'contact_person': row[4],
                'phone': row[5],
                'email': row[6],
                'created_at': row[7].isoformat() if row[7] else None
            }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'partner': new_partner})
            }
        
        # PUT - обновить партнёра
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            partner_id = body.get('id')
            
            cursor.execute("""
                UPDATE t_p81623955_crm_system_creation.partners
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
                cursor.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Partner not found'})
                }
            
            updated_partner = {
                'id': row[0],
                'partner_id': row[1],
                'type': row[2],
                'company_name': row[3],
                'contact_person': row[4],
                'phone': row[5],
                'email': row[6],
                'updated_at': row[7].isoformat() if row[7] else None
            }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'partner': updated_partner})
            }
        
        # DELETE - удалить партнёра
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {})
            partner_id = query_params.get('id')
            
            cursor.execute("""
                DELETE FROM t_p81623955_crm_system_creation.partners
                WHERE id = %s
            """, (partner_id,))
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True})
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
