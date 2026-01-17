import json
import os
import requests
from datetime import datetime

def handler(event: dict, context) -> dict:
    """
    Загружает лиды из Avito (демо-режим с примерами)
    Полная интеграция требует OAuth авторизации через веб-интерфейс Avito
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    # Генерируем демо-лиды для демонстрации работы CRM
    demo_leads = [
        {
            'id': 'avito_1',
            'source': 'avito',
            'client': 'Александр П.',
            'phone': '+7 (905) 123-45-67',
            'message': 'Здравствуйте, интересует ваш автомобиль. Можно посмотреть в выходные?',
            'car': 'Toyota Camry 2020',
            'stage': 'new',
            'created': datetime.now().isoformat(),
            'lastActivity': datetime.now().isoformat(),
            'sum': 1850000,
            'views': 247,
            'contacts': 12
        },
        {
            'id': 'avito_2',
            'source': 'avito',
            'client': 'Мария К.',
            'phone': '+7 (916) 234-56-78',
            'message': 'Добрый день! Торг возможен? Интересует обмен с доплатой.',
            'car': 'BMW X5 2019',
            'stage': 'contact',
            'created': datetime.now().isoformat(),
            'lastActivity': datetime.now().isoformat(),
            'sum': 3200000,
            'views': 189,
            'contacts': 8
        },
        {
            'id': 'avito_3',
            'source': 'avito',
            'client': 'Дмитрий Н.',
            'phone': '+7 (926) 345-67-89',
            'message': 'Машина в отличном состоянии? Хочу приехать завтра посмотреть.',
            'car': 'Mercedes-Benz E-Class 2018',
            'stage': 'meeting',
            'created': datetime.now().isoformat(),
            'lastActivity': datetime.now().isoformat(),
            'sum': 2750000,
            'views': 312,
            'contacts': 15
        },
        {
            'id': 'avito_4',
            'source': 'avito',
            'client': 'Ольга С.',
            'phone': '+7 (903) 456-78-90',
            'message': 'Рассматриваю покупку в кредит. Какие документы нужны?',
            'car': 'Kia Rio 2021',
            'stage': 'new',
            'created': datetime.now().isoformat(),
            'lastActivity': datetime.now().isoformat(),
            'sum': 1150000,
            'views': 156,
            'contacts': 6
        },
        {
            'id': 'avito_5',
            'source': 'avito',
            'client': 'Сергей В.',
            'phone': '+7 (915) 567-89-01',
            'message': 'Готов купить сегодня за наличные. Где можно встретиться?',
            'car': 'Volkswagen Polo 2020',
            'stage': 'offer',
            'created': datetime.now().isoformat(),
            'lastActivity': datetime.now().isoformat(),
            'sum': 980000,
            'views': 201,
            'contacts': 9
        }
    ]
    
    leads = demo_leads
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'count': len(leads),
            'leads': leads,
            'demo': True,
            'message': 'Демо-данные. Для реальной интеграции с Avito нужна OAuth авторизация.'
        }),
        'isBase64Encoded': False
    }