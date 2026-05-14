import { Link } from 'react-router-dom'
import styles from './LegalPages.module.css'

export default function CookiesPolicy() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.backLink}>← Volver al inicio</Link>
        
        <h1 className={styles.title}>Política de Cookies</h1>
        <p className={styles.updated}>Última actualización: Mayo 2026</p>

        <section className={styles.section}>
          <h2>1. ¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita 
            un sitio web. Permiten que el sitio web recuerde sus acciones y preferencias durante un período 
            de tiempo, para mejorar su experiencia de navegación.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. ¿Qué cookies utilizamos?</h2>
          
          <h3>Cookies Técnicas (Necesarias)</h3>
          <p>
            Estas cookies son esenciales para el funcionamiento de la plataforma y no pueden ser desactivadas:
          </p>
          <ul>
            <li><strong>auth_token:</strong> Mantiene su sesión activa y permite el acceso a su cuenta</li>
            <li><strong>csrf_token:</strong> Protege contra ataques de falsificación de peticiones</li>
            <li><strong>Duración:</strong> Sesión o hasta 30 días si selecciona &quot;Recordarme&quot;</li>
          </ul>

          <h3>Cookies de Preferencias</h3>
          <p>
            Estas cookies permiten recordar sus preferencias de uso:
          </p>
          <ul>
            <li><strong>theme_preference:</strong> Guarda su preferencia de tema (claro/oscuro)</li>
            <li><strong>language:</strong> Almacena su idioma preferido</li>
            <li><strong>Duración:</strong> 1 año</li>
          </ul>

          <h3>Cookies de Análisis</h3>
          <p>
            Utilizamos cookies analíticas para entender cómo los usuarios interactúan con la plataforma 
            y mejorar nuestros servicios:
          </p>
          <ul>
            <li><strong>_ga, _gid:</strong> Google Analytics - Análisis de uso anónimo</li>
            <li><strong>Duración:</strong> 2 años (_ga) y 24 horas (_gid)</li>
            <li><strong>Puede desactivarlas:</strong> Sí, mediante la configuración de cookies</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Cookies de Terceros</h2>
          <p>
            Algunos servicios externos que utilizamos pueden establecer sus propias cookies:
          </p>
          <ul>
            <li><strong>Google Analytics:</strong> Para análisis estadístico del tráfico web</li>
            <li><strong>Cloudflare:</strong> Para seguridad y optimización del rendimiento</li>
          </ul>
          <p>
            Estas cookies están sujetas a las políticas de privacidad de los respectivos terceros.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. ¿Cómo gestionar las cookies?</h2>
          <p>
            Puede controlar y/o eliminar las cookies según desee. Para más información, visite{' '}
            <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className={styles.link}>
              aboutcookies.org
            </a>
          </p>
          
          <h3>Configuración del navegador</h3>
          <p>
            Puede configurar su navegador para rechazar todas las cookies o para que le avise cuando 
            se envíe una cookie. Sin embargo, tenga en cuenta que algunas funciones de la plataforma 
            pueden no funcionar correctamente sin cookies.
          </p>
          <ul>
            <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
            <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies</li>
            <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
            <li><strong>Edge:</strong> Configuración → Cookies y permisos del sitio</li>
          </ul>

          <h3>Panel de configuración de Seraphon</h3>
          <p>
            Puede gestionar sus preferencias de cookies directamente desde su cuenta en la sección 
            de Configuración → Privacidad.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Consentimiento</h2>
          <p>
            Al utilizar nuestra plataforma, usted acepta el uso de cookies técnicas necesarias para 
            el funcionamiento del servicio. Para cookies de análisis y preferencias, solicitamos su 
            consentimiento explícito mediante el banner de cookies que aparece en su primera visita.
          </p>
          <p>
            Puede retirar su consentimiento en cualquier momento modificando la configuración de cookies 
            en su navegador o en su panel de usuario.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Actualizaciones de esta política</h2>
          <p>
            Podemos actualizar esta Política de Cookies periódicamente para reflejar cambios en las 
            cookies que utilizamos o por razones operativas, legales o regulatorias. Le recomendamos 
            revisar esta página regularmente.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Más información</h2>
          <p>
            Para más información sobre cómo tratamos sus datos personales, consulte nuestra{' '}
            <Link to="/politica-privacidad" className={styles.link}>Política de Privacidad</Link>.
          </p>
          <p>
            Si tiene preguntas sobre nuestra Política de Cookies, puede contactarnos en:{' '}
            <a href="mailto:privacy@seraphon.io" className={styles.link}>privacy@seraphon.io</a>
          </p>
        </section>
      </div>
    </div>
  )
}
