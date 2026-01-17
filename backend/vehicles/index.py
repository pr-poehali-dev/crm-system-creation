"""
API для управления автопарком
Добавление, редактирование, удаление и получение информации об автомобилях
"""

import json
import os
import psycopg2
from datetime import datetime

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
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise Exception('DATABASE_URL not configured')
        
        conn = psycopg2.connect(dsn)
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
                    FROM t_p81623955_crm_system_creation.fleet
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
                    FROM t_p81623955_crm_system_creation.fleet
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
        
        elif method == 'POST':
            data = json.loads(event.get('body', '{}'))
            
            cur.execute('''
                INSERT INTO t_p81623955_crm_system_creation.fleet (
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
                UPDATE t_p81623955_crm_system_creation.fleet
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
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()