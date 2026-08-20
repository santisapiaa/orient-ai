import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uwaskoziwgwisfmtjomv.supabase.co';
const supabaseKey = 'sb_publishable_PpSzBTdNnW1BjINPC7ZlOw_IfHLiWGz';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Insertando Universidades...');
  
  const { data: unis, error: uError } = await supabase.from('universities').insert([
    { name: 'Universidad Siglo XXI', city: 'Mendoza', is_premium: true, description: 'Aprende economía con casos reales de empresas líderes. Prácticas profesionales desde el primer año.', video_text: '"Un día estudiando Economía"', author_handle: '@lucas_alumni' },
    { name: 'Universidad Nacional', city: 'Mendoza', is_premium: false, description: 'Facultad con plan de estudios tradicional y sólido enfocado en investigación.', video_text: null, author_handle: null },
    { name: 'Universidad Tecnológica', city: 'Mendoza', is_premium: true, description: 'Laboratorios de última generación. Convenios directos con Google y Globant.', video_text: '"Así es el lab de robótica"', author_handle: '@sofia_dev' },
    { name: 'Universidad Privada de Medicina', city: 'Mendoza', is_premium: true, description: 'Prácticas en el hospital universitario desde tercer año. Simuladores virtuales.', video_text: '"Práctica de sutura en simulación"', author_handle: '@medicina_oficial' }
  ]).select();
  
  if (uError) {
    console.error('Error insertando universidades:', uError);
    return;
  }
  
  console.log('Universidades insertadas correctamente.');

  const uSiglo = unis.find(u => u.name === 'Universidad Siglo XXI');
  const uNac = unis.find(u => u.name === 'Universidad Nacional');
  const uTec = unis.find(u => u.name === 'Universidad Tecnológica');
  const uMed = unis.find(u => u.name === 'Universidad Privada de Medicina');

  console.log('Insertando Carreras...');

  const careers = [
    // Negocios
    { university_id: uSiglo.id, name: 'Licenciatura en Economía', category: 'Negocios', duration: '4 años', badge: 'Grado' },
    { university_id: uSiglo.id, name: 'Tecnicatura en Finanzas', category: 'Negocios', duration: '2 años', badge: 'Pregrado' },
    { university_id: uNac.id, name: 'Contador Público Nacional', category: 'Negocios', duration: '5 años', badge: 'Grado' },
    { university_id: uNac.id, name: 'Licenciatura en Administración', category: 'Negocios', duration: '5 años', badge: 'Grado' },
    
    // Tecnología
    { university_id: uTec.id, name: 'Ingeniería en Software e IA', category: 'Tecnología', duration: '5 años', badge: 'Grado' },
    { university_id: uTec.id, name: 'Analista Programador', category: 'Tecnología', duration: '3 años', badge: 'Pregrado' },
    { university_id: uNac.id, name: 'Licenciatura en Ciencias de la Computación', category: 'Tecnología', duration: '5 años', badge: 'Grado' },
    
    // Salud
    { university_id: uMed.id, name: 'Medicina General', category: 'Salud', duration: '6 años', badge: 'Grado' },
    { university_id: uMed.id, name: 'Licenciatura en Enfermería', category: 'Salud', duration: '4 años', badge: 'Grado' },
    { university_id: uNac.id, name: 'Medicina', category: 'Salud', duration: '6 años', badge: 'Grado' }
  ];
  
  const { error: cError } = await supabase.from('careers').insert(careers);
  
  if (cError) {
    console.error('Error insertando carreras:', cError);
    return;
  }
  
  console.log('Carreras insertadas correctamente. ¡Base de datos lista!');
}

seed();
