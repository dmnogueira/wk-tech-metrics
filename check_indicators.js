import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kszbfbqzattjtpywlqfz.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzemJmYnF6YXR0anRweXdscWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNjY4ODQsImV4cCI6MjA3NzY0Mjg4NH0.GZtabgZx65hcVZVsxGZ6F7TMaFH2F8l-6QA6sFfCBSI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIndicators() {
  console.log('🔍 Verificando indicadores no Supabase...\n');
  
  try {
    // Buscar todos os indicadores
    const { data, error, count } = await supabase
      .from('indicators')
      .select('*', { count: 'exact' })
      .limit(10);
    
    if (error) {
      console.error('❌ Erro ao buscar indicadores:', error.message);
      console.error('Detalhes:', error);
      return;
    }
    
    console.log(`✅ Total de indicadores no banco: ${count || 0}`);
    
    if (data && data.length > 0) {
      console.log('\n📊 Primeiros 10 indicadores:');
      data.forEach((ind, idx) => {
        console.log(`  ${idx + 1}. ${ind.acronym} - ${ind.name} (${ind.category})`);
      });
      
      // Contar por categoria
      const { data: categories } = await supabase
        .from('indicators')
        .select('category');
      
      if (categories) {
        const catCounts = {};
        categories.forEach(c => {
          catCounts[c.category] = (catCounts[c.category] || 0) + 1;
        });
        
        console.log('\n📁 Indicadores por categoria:');
        Object.entries(catCounts).forEach(([cat, count]) => {
          console.log(`  - ${cat}: ${count}`);
        });
      }
    } else {
      console.log('\n⚠️  NENHUM indicador encontrado no banco!');
      console.log('💡 A migration precisa ser executada.');
      console.log('\n📝 Para executar a migration:');
      console.log('1. Acesse: https://supabase.com/dashboard');
      console.log('2. Projeto: kszbfbqzattjtpywlqfz');
      console.log('3. SQL Editor > New Query');
      console.log('4. Cole o conteúdo de: supabase/migrations/20251116000000_seed_indicators_from_spreadsheet.sql');
      console.log('5. Execute (Run)');
    }
  } catch (err) {
    console.error('❌ Erro ao verificar:', err);
  }
}

checkIndicators();
