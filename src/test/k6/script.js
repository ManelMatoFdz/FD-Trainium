import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ============================================
// MÉTRICAS PERSONALIZADAS
// ============================================
const errorRate = new Rate('error_rate');
const requestDuration = new Trend('request_duration', true);
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

// ============================================
// CONFIGURACIÓN DEL TEST
// ============================================
export let options = {
  // Escenario de carga gradual
  stages: [
    { duration: '10s', target: 5 },   // Rampa: 0 → 5 usuarios en 10s
    { duration: '20s', target: 10 },  // Rampa: 5 → 10 usuarios en 20s
    { duration: '20s', target: 10 },  // Mantener 10 usuarios por 20s
    { duration: '10s', target: 0 },   // Rampa de bajada: 10 → 0 en 10s
  ],

  // Umbrales de rendimiento (estrictos para endpoints autenticados)
  thresholds: {
    'http_req_duration': ['p(95)<1000', 'p(99)<2000'],  // p95 < 1s, p99 < 2s
    'http_req_failed': ['rate<0.10'],                   // Máximo 10% errores HTTP
    'error_rate': ['rate<0.05'],                        // Tasa de error < 5%
  },
};

// URL base del backend con context path
const BASE_URL = 'http://localhost:8080/trainium';

// Credenciales de test (usuario existente en la BD - ver 2-data.sql)
// La contraseña hasheada en la BD corresponde a 'password'
const TEST_USER = {
  userName: 'usuario',
  password: 'test'
};

// ============================================
// FUNCIÓN DE SETUP - Se ejecuta una vez al inicio
// ============================================
export function setup() {
  // Intentar login para obtener token
  const loginPayload = JSON.stringify(TEST_USER);
  const loginParams = { headers: { 'Content-Type': 'application/json' } };
  
  const loginRes = http.post(`${BASE_URL}/api/users/login`, loginPayload, loginParams);
  
  if (loginRes.status === 200) {
    try {
      const body = JSON.parse(loginRes.body);
      console.log('✅ Login exitoso - Token obtenido');
      return { token: body.serviceToken };
    } catch (e) {
      console.log('⚠️ Login exitoso pero no se pudo parsear el token');
      return { token: null };
    }
  } else {
    console.log(`⚠️ Login falló con status ${loginRes.status} - Continuando sin autenticación`);
    return { token: null };
  }
}

// ============================================
// FUNCIÓN PRINCIPAL DEL TEST
// ============================================
export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Añadir token si está disponible
  if (data && data.token) {
    headers['Authorization'] = `Bearer ${data.token}`;
  }
  const params = { headers };

  // Grupo 1: Endpoints públicos (no requieren auth)
  group('Public Endpoints', function () {
    // Test de categorías
    let res = http.get(`${BASE_URL}/api/categories`, params);
    
    let success = check(res, {
      'categories - status 2xx/4xx': (r) => r.status >= 200 && r.status < 500,
      'categories - response time < 2s': (r) => r.timings.duration < 2000,
    });

    requestDuration.add(res.timings.duration);
    errorRate.add(res.status >= 400);
    
    if (res.status >= 200 && res.status < 300) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
    }
  });

  // Grupo 2: Listado de ejercicios
  group('Exercises Endpoint', function () {
    let res = http.get(`${BASE_URL}/api/exercises?page=0&size=5`, params);
    
    check(res, {
      'exercises - status 2xx/4xx': (r) => r.status >= 200 && r.status < 500,
      'exercises - response time < 2s': (r) => r.timings.duration < 2000,
    });

    requestDuration.add(res.timings.duration);
    errorRate.add(res.status >= 400);
  });

  // Grupo 3: Listado de rutinas públicas
  group('Routines Endpoint', function () {
    let res = http.get(`${BASE_URL}/api/routines/`, params);
    
    check(res, {
      'routines - status 2xx/4xx': (r) => r.status >= 200 && r.status < 500,
      'routines - response time < 2s': (r) => r.timings.duration < 2000,
    });

    requestDuration.add(res.timings.duration);
    errorRate.add(res.status >= 400);
  });

  // Pequeña pausa entre iteraciones (simula comportamiento real)
  sleep(0.3);
}

// ============================================
// RESUMEN PERSONALIZADO AL FINALIZAR
// ============================================
export function handleSummary(data) {
  const duration = data.metrics.http_req_duration?.values || {};
  const reqs = data.metrics.http_reqs?.values || {};
  const failed = data.metrics.http_req_failed?.values || {};
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS DE RENDIMIENTO');
  console.log('='.repeat(60));
  
  console.log('\n⏱️  TIEMPOS DE RESPUESTA:');
  console.log(`   Promedio: ${duration.avg?.toFixed(2) || 0}ms`);
  console.log(`   Mínimo:   ${duration.min?.toFixed(2) || 0}ms`);
  console.log(`   Máximo:   ${duration.max?.toFixed(2) || 0}ms`);
  console.log(`   p(90):    ${duration['p(90)']?.toFixed(2) || 0}ms`);
  console.log(`   p(95):    ${duration['p(95)']?.toFixed(2) || 0}ms`);
  console.log(`   p(99):    ${duration['p(99)']?.toFixed(2) || 0}ms`);
  
  console.log('\n✅ PETICIONES:');
  console.log(`   Total:      ${reqs.count || 0}`);
  console.log(`   Tasa:       ${reqs.rate?.toFixed(2) || 0} req/s`);
  console.log(`   Fallidas:   ${(failed.rate * 100)?.toFixed(2) || 0}%`);
  
  console.log('\n📈 ITERACIONES:');
  console.log(`   Completadas: ${data.metrics.iterations?.values?.count || 0}`);
  console.log(`   VUs máximos: ${data.metrics.vus_max?.values?.max || 0}`);
  
  console.log('\n' + '='.repeat(60));
  
  // Evaluar umbrales
  const thresholdsPassed = Object.entries(data.metrics)
    .filter(([_, m]) => m.thresholds)
    .every(([_, m]) => Object.values(m.thresholds).every(t => t.ok));
  
  if (thresholdsPassed) {
    console.log('✅ TODOS LOS UMBRALES CUMPLIDOS');
  } else {
    console.log('⚠️  ALGUNOS UMBRALES NO SE CUMPLIERON');
  }
  console.log('='.repeat(60) + '\n');

  return {};
}