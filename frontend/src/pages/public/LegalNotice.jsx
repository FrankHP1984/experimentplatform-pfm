import { Link } from 'react-router-dom'
import styles from './LegalPages.module.css'

export default function LegalNotice() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.backLink}>← Volver al inicio</Link>
        
        <h1 className={styles.title}>Aviso Legal</h1>
        <p className={styles.updated}>Última actualización: Mayo 2026</p>

        <section className={styles.section}>
          <h2>1. Información General</h2>
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad 
            de la Información y de Comercio Electrónico, se informa a los usuarios de los datos identificativos 
            de la entidad titular de este sitio web:
          </p>
          <ul>
            <li><strong>Denominación social:</strong> Seraphon Research Platform</li>
            <li><strong>Dominio:</strong> seraphon.io</li>
            <li><strong>Correo electrónico:</strong> legal@seraphon.io</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>2. Objeto</h2>
          <p>
            Seraphon es una plataforma digital diseñada para facilitar la investigación científica mediante 
            la creación, gestión y análisis de experimentos estructurados. El sitio web proporciona herramientas 
            para investigadores y participantes en estudios académicos.
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. Condiciones de Uso</h2>
          <p>
            El acceso y uso de este sitio web atribuye la condición de usuario y supone la aceptación plena 
            de todas las condiciones incluidas en este Aviso Legal. El usuario se compromete a:
          </p>
          <ul>
            <li>Hacer un uso adecuado y lícito del sitio web</li>
            <li>No utilizar la plataforma para fines ilícitos o contrarios a la buena fe</li>
            <li>No introducir virus informáticos o realizar acciones que alteren el funcionamiento del sitio</li>
            <li>Respetar los derechos de propiedad intelectual e industrial</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Propiedad Intelectual</h2>
          <p>
            Todos los contenidos del sitio web, incluyendo textos, imágenes, diseños, logotipos, código fuente 
            y cualquier otro elemento, son propiedad de Seraphon o de terceros que han autorizado su uso, 
            y están protegidos por las leyes de propiedad intelectual e industrial.
          </p>
          <p>
            Queda prohibida la reproducción, distribución, comunicación pública y transformación de cualquier 
            contenido sin autorización expresa del titular de los derechos.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Responsabilidad</h2>
          <p>
            Seraphon no se hace responsable de los daños y perjuicios que pudieran derivarse de:
          </p>
          <ul>
            <li>Interrupciones, errores u omisiones en el servicio</li>
            <li>Contenidos introducidos por los usuarios</li>
            <li>Uso indebido de la plataforma por parte de los usuarios</li>
            <li>Fallos técnicos o de conectividad ajenos a nuestra voluntad</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>6. Protección de Datos</h2>
          <p>
            El tratamiento de datos personales se rige por nuestra{' '}
            <Link to="/politica-privacidad" className={styles.link}>Política de Privacidad</Link> y 
            nuestra <Link to="/politica-cookies" className={styles.link}>Política de Cookies</Link>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Legislación Aplicable</h2>
          <p>
            Las presentes condiciones se rigen por la legislación española. Para cualquier controversia 
            derivada del uso de este sitio web, las partes se someten a los Juzgados y Tribunales del 
            domicilio del usuario.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Contacto</h2>
          <p>
            Para cualquier consulta relacionada con este Aviso Legal, puede contactarnos en:{' '}
            <a href="mailto:legal@seraphon.io" className={styles.link}>legal@seraphon.io</a>
          </p>
        </section>
      </div>
    </div>
  )
}
