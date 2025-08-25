/** @type {import('tailwindcss').Config} */

// Importar o defaultTheme usando require
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Cores personalizadas (sem alterações)
      colors: {
    // Cores de Destaque (Mantidas ou ligeiramente ajustadas)
    'primary': '#5E81AC', // Um azul mais suave e acinzentado
    'secondary': '#BF616A', // Um vermelho suave para alertas ou ações secundárias
    'success': '#A3BE8C', // Verde suave
    'warning': '#EBCB8B', // Amarelo suave
    'danger': '#BF616A',  // Vermelho suave

    // Paleta Principal (A Grande Mudança)
    'text': '#ECEFF4',       // Texto principal (quase branco)
    'subtext': '#D8DEE9',   // Texto secundário (cinza claro)
    
    'background': '#2E3440', // Fundo principal (cinza-azulado muito escuro)
    'surface': '#D8DEE9',  //#3B4252    // Fundo de "cartas", navbar, painéis (um tom mais claro)
    'crust': '#4C566A',      // Bordas e separadores (um tom ainda mais claro)
    
    // Cores de Interação (para botões, links, etc.)
    'blue': '#81A1C1',       // O novo azul principal para links e botões
    'mantle': '#434C5E',     // Cor para elementos como dropdowns
  },
      // Fontes personalizadas (sem alterações)
      fontFamily: {
        'sans': ['Poppins', ...defaultTheme.fontFamily.sans],
        'mono': ['Fira Code', ...defaultTheme.fontFamily.mono],
        'display': ['Cal Sans', 'sans-serif'],
      },
      // Tamanhos de tela personalizados (sem alterações)
      screens: {
        'xs': '475px',
        ...defaultTheme.screens,
        '3xl': '1792px',
      },
      // Espaçamento adicional (sem alterações)
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      // Bordas personalizadas (sem alterações)
      borderRadius: {
        '4xl': '2rem',
      },
      // Opacidade personalizada (sem alterações)
      opacity: {
        '15': '0.15',
        '85': '0.85',
      },
      // Animations e keyframes (sem alterações)
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      // Gradientes personalizados (sem alterações)
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  }, 
  
  // CORREÇÃO: Importar os plugins usando require()
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      }
      addUtilities(newUtilities)
    },
  ],
  // Configuração do dark mode (sem alterações)
  darkMode: 'class',
}