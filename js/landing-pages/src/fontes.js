// Fonte da empresa (v0.23.0): `marca.fonte` troca a família dos templates que usam a variável
// `--olp-fonte` (hoje o Leader; os demais ignoram). O que vai para o link é só um nome da lista abaixo.
import { useEffect } from 'react'

export const FONTES_MARCA = ['Open Sans', 'Inter', 'Poppins', 'Montserrat', 'Nunito', 'Raleway']

const href = fonte => `https://fonts.googleapis.com/css2?family=${fonte.replace(/ /g, '+')}:wght@400;500;700;800&display=swap`

// Estilo do elemento raiz da página: define a variável que o CSS dos templates lê.
export function estiloFonte(fonte) {
  return FONTES_MARCA.includes(fonte) ? { '--olp-fonte': `'${fonte}'` } : undefined
}

export function useFonteDaMarca(fonte) {
  useEffect(() => {
    if (!FONTES_MARCA.includes(fonte)) return
    const url = href(fonte)
    if (document.querySelector(`link[href="${url}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    document.head.appendChild(link)
  }, [fonte])
}
