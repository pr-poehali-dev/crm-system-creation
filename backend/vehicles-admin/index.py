"""
Административные операции с автопарком: очистка, массовое удаление
"""

import json
import os
import psycopg2

def handler(event, context):
    """
    DELETE /vehicles-admin?action=clear - очистить весь автопарк
    DELETE /vehicles-admin?action=delete&id=123 - удалить конкретный автомобиль
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'DELETE':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Only DELETE method allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise Exception('DATABASE_URL not configured')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'delete')
        
        if action == 'clear':
            # Удаляем ВСЕ автомобили из базы
            cur.execute('DELETE FROM t_p81623955_crm_system_creation.fleet')
            deleted_count = cur.rowcount
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': True,
                    'message': f'Удалено автомобилей: {deleted_count}'
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'delete':
            # Удаляем конкретный автомобиль по ID
            vehicle_id = params.get('id')
            if not vehicle_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'ID автомобиля не указан'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                'DELETE FROM t_p81623955_crm_system_creation.fleet WHERE id = %s',
                (vehicle_id,)
            )
            
            if cur.rowcount == 0:
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Автомобиль не найден'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': True,
                    'message': f'Автомобиль {vehicle_id} удалён'
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Неизвестное действие'}),
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