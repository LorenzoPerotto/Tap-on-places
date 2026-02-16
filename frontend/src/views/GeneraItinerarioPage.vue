<template>
  <div class="hero-background">
    <AppHeader title="Genera Itinerario con AI" />

    <main class="generate-itinerary-container">
      <h1>✨ Genera Itinerario con Intelligenza Artificiale</h1>

      <!-- Banner implementazione futura -->
      <div class="implementation-banner">
        <div class="banner-icon">🚧</div>
        <h2>Funzionalità in Sviluppo</h2>
        <p>
          La generazione automatica di itinerari tramite Intelligenza Artificiale 
          sarà disponibile nella prossima versione dell'app.
        </p>
        <p>
          Il sistema analizzerà le tue preferenze e creerà percorsi personalizzati 
          basandosi su dati real-time di affluenza, meteo e interessi personali.
        </p>

        <div class="ai-features">
          <h3>Funzionalità Previste:</h3>
          <ul class="features-list">
            <li>🎯 <strong>Personalizzazione Avanzata:</strong> L'AI analizzerà i tuoi interessi e cronologia</li>
            <li>📊 <strong>Analisi Dati Real-Time:</strong> Ottimizzazione basata su affluenza corrente</li>
            <li>🌤️ <strong>Integrazione Meteo:</strong> Suggerimenti adattati alle condizioni meteo</li>
            <li>⏱️ <strong>Ottimizzazione Tempo:</strong> Percorsi ottimizzati per ridurre spostamenti</li>
            <li>💰 <strong>Gestione Budget:</strong> Itinerari che rispettano il tuo budget</li>
            <li>♿ <strong>Accessibilità:</strong> Percorsi adattati a esigenze specifiche</li>
            <li>🗣️ <strong>Multi-Lingua:</strong> Descrizioni e suggerimenti nella tua lingua</li>
          </ul>
        </div>

        <p class="coming-soon-text">
          <strong>🎉 Nel frattempo, puoi creare il tuo percorso personalizzato manualmente!</strong>
        </p>

        <button class="btn-primary-large" @click="router.push('/crea-percorso')">
          🛤️ Crea Percorso Manuale
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'

const router = useRouter()
</script>

<style scoped>
.hero-background {
  min-height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
              url('/trento-bg.jpg') center/cover no-repeat;
  background-attachment: fixed;
}

.generate-itinerary-container {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.generate-itinerary-container h1 {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  font-size: 36px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.implementation-banner {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  padding: 40px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(255, 152, 0, 0.3);
  border: 3px solid #f57c00;
}

.banner-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.implementation-banner h2 {
  color: white;
  font-size: 32px;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.implementation-banner p {
  color: white;
  font-size: 18px;
  margin-bottom: 15px;
  line-height: 1.6;
}

.ai-features {
  background: white;
  padding: 25px;
  border-radius: 8px;
  margin: 30px 0;
  text-align: left;
}

.ai-features h3 {
  color: #ff9800;
  margin-bottom: 15px;
  font-size: 22px;
}

.features-list {
  list-style: none;
  padding: 0;
}

.features-list li {
  padding: 12px 0;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  color: #333;
}

.features-list li:last-child {
  border-bottom: none;
}

.coming-soon-text {
  font-size: 20px !important;
  margin-top: 30px !important;
  color: white !important;
}

.btn-primary-large {
  padding: 18px 50px;
  border: none;
  border-radius: 8px;
  background: white;
  color: #ff9800;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-primary-large:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .generate-itinerary-container {
    padding: 20px;
  }

  .generate-itinerary-container h1 {
    font-size: 28px;
  }

  .implementation-banner {
    padding: 25px;
  }

  .banner-icon {
    font-size: 60px;
  }

  .implementation-banner h2 {
    font-size: 24px;
  }

  .implementation-banner p {
    font-size: 16px;
  }

  .btn-primary-large {
    width: 100%;
    font-size: 18px;
  }
}
</style>
