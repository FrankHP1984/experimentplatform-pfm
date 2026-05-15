import { Link } from 'react-router-dom'
import styles from './LegalPages.module.css'

export default function PrivacyPolicy() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.backLink}>← Volver al inicio</Link>

        <h1 className={styles.title}>Política de Privacidad y Tratamiento de Datos</h1>
        <p className={styles.updated}>Última actualización: Mayo 2026</p>

        <section className={styles.section}>
          <h2>1. ¿Quién trata tus datos?</h2>
          <p>
            Los datos personales recogidos a través de esta plataforma son tratados por el
            investigador responsable del estudio al que has sido invitado, en el marco de
            un proyecto de investigación académica gestionado a través de{' '}
            <strong>Seraphon Research Platform</strong>.
          </p>
          <p>
            Seraphon actúa como encargado del tratamiento: proporciona la infraestructura
            técnica para recoger y almacenar los datos, pero no los utiliza para ningún
            fin propio ni los comparte con terceros ajenos al estudio.
          </p>
          <ul>
            <li><strong>Plataforma:</strong> Seraphon Research Platform</li>
            <li><strong>Contacto:</strong> <a href="mailto:privacidad@seraphon.io" className={styles.link}>privacidad@seraphon.io</a></li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>2. ¿Qué datos recogemos?</h2>
          <p>
            Al aceptar una invitación y registrarte como participante, recogemos los siguientes
            datos personales:
          </p>
          <ul>
            <li><strong>Datos de identificación:</strong> nombre, apellidos y dirección de correo electrónico.</li>
            <li><strong>Datos demográficos:</strong> fecha de nacimiento y género. Estos datos se recogen porque son variables habituales en estudios de ciencias del comportamiento y pueden ser relevantes para el análisis de resultados.</li>
            <li><strong>Datos de participación:</strong> respuestas a los cuestionarios y preguntas de cada fase del estudio. Estos son los datos centrales de la investigación.</li>
            <li><strong>Datos técnicos:</strong> fecha y hora de las respuestas, fase del estudio en que se recogieron, y grupo experimental asignado (cuando el diseño del estudio lo requiere).</li>
          </ul>
          <p>
            No recogemos datos especialmente sensibles (datos de salud, orientación sexual,
            creencias religiosas, etc.) salvo que el propio cuestionario del estudio lo
            requiera explícitamente, en cuyo caso se indicará antes de comenzar.
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. ¿Para qué usamos tus datos?</h2>
          <p>
            Tus datos se utilizan exclusivamente para los siguientes fines:
          </p>
          <ul>
            <li><strong>Gestionar tu participación en el estudio:</strong> registrar tu inscripción, asignarte al grupo experimental correspondiente y permitirte acceder a los cuestionarios de cada fase.</li>
            <li><strong>Recoger y conservar tus respuestas:</strong> almacenar de forma segura las respuestas que envíes durante el estudio.</li>
            <li><strong>Análisis científico:</strong> el equipo investigador analizará los datos agregados para obtener conclusiones en el marco del proyecto de investigación. Los resultados pueden publicarse en trabajos académicos, siempre de forma anonimizada (sin que puedas ser identificado).</li>
            <li><strong>Verificar la integridad del estudio:</strong> detectar y prevenir participaciones duplicadas o irregulares que afecten a la validez científica de los datos.</li>
          </ul>
          <p>
            Tus datos <strong>no se usan</strong> para publicidad, perfilado comercial, ni para
            ningún fin ajeno a la investigación descrita.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. Base legal del tratamiento</h2>
          <p>
            El tratamiento de tus datos se basa en el <strong>consentimiento explícito</strong> que
            otorgas al aceptar participar en el estudio (art. 6.1.a del Reglamento General de
            Protección de Datos — RGPD).
          </p>
          <p>
            Tienes derecho a retirar ese consentimiento en cualquier momento sin que ello
            afecte a la licitud del tratamiento realizado antes de la retirada. Si te retiras,
            tus datos de participación podrán conservarse de forma anonimizada si ya formaban
            parte del análisis en curso.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. ¿Cuánto tiempo conservamos tus datos?</h2>
          <p>
            Tus datos personales identificables (nombre, correo, fecha de nacimiento, género)
            se conservan durante el período activo del estudio y hasta <strong>12 meses después</strong>{' '}
            de su finalización, tiempo necesario para completar el análisis y la publicación
            de resultados.
          </p>
          <p>
            Transcurrido ese plazo, los datos identificativos se eliminan o se anonomizan de
            forma irreversible. Las respuestas anonimizadas pueden conservarse indefinidamente
            con fines de archivo científico.
          </p>
          <p>
            Puedes solicitar la eliminación anticipada de tus datos en cualquier momento
            (ver sección de derechos).
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. ¿Quién tiene acceso a tus datos?</h2>
          <p>
            El acceso a tus datos está restringido a:
          </p>
          <ul>
            <li><strong>El equipo investigador responsable del estudio</strong> al que perteneces. Solo pueden ver los datos de sus propios estudios.</li>
            <li><strong>El personal técnico de Seraphon</strong> en la medida estrictamente necesaria para el mantenimiento y soporte de la plataforma.</li>
          </ul>
          <p>
            Tus datos <strong>no se ceden a terceros</strong>, salvo obligación legal. No se
            realizan transferencias internacionales de datos fuera del Espacio Económico
            Europeo, salvo que los servicios de infraestructura utilizados (como el proveedor
            de base de datos o el proveedor de autenticación) lo requieran, en cuyo caso
            operan bajo las garantías establecidas por el RGPD.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Tus derechos</h2>
          <p>
            En virtud del RGPD, tienes los siguientes derechos sobre tus datos personales:
          </p>
          <ul>
            <li><strong>Acceso:</strong> puedes solicitar una copia de los datos que tenemos sobre ti.</li>
            <li><strong>Rectificación:</strong> puedes pedirnos que corrijamos datos inexactos o incompletos.</li>
            <li><strong>Supresión:</strong> puedes solicitar que eliminemos tus datos cuando ya no sean necesarios para los fines del estudio.</li>
            <li><strong>Oposición y limitación:</strong> puedes oponerte al tratamiento o solicitar que lo limitemos en determinadas circunstancias.</li>
            <li><strong>Portabilidad:</strong> puedes solicitar tus datos en un formato estructurado y de uso común.</li>
            <li><strong>Retirada del consentimiento:</strong> puedes retirar tu consentimiento en cualquier momento simplemente abandonando el estudio desde tu panel de participante. Ello no afecta a la licitud del tratamiento previo.</li>
          </ul>
          <p>
            Para ejercer cualquiera de estos derechos, escríbenos a{' '}
            <a href="mailto:privacidad@seraphon.io" className={styles.link}>privacidad@seraphon.io</a>{' '}
            indicando el estudio en el que participas y el derecho que deseas ejercer.
            Responderemos en un plazo máximo de 30 días.
          </p>
          <p>
            Si consideras que el tratamiento no es conforme al RGPD, tienes derecho a
            presentar una reclamación ante la{' '}
            <strong>Agencia Española de Protección de Datos (AEPD)</strong> en{' '}
            <a href="https://www.aepd.es" className={styles.link} target="_blank" rel="noopener noreferrer">www.aepd.es</a>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Voluntariedad y consecuencias de no participar</h2>
          <p>
            Tu participación es completamente <strong>voluntaria</strong>. No estás obligado a
            participar y puedes retirarte en cualquier momento sin necesidad de justificarlo y
            sin ninguna consecuencia negativa para ti.
          </p>
          <p>
            Si decides no aceptar o retirarte, los datos que ya hayas enviado podrán ser
            conservados de forma anonimizada si ya formaban parte del análisis. Si deseas
            que se eliminen también esos datos, puedes solicitarlo expresamente.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Seguridad de los datos</h2>
          <p>
            Seraphon implementa medidas técnicas y organizativas adecuadas para proteger tus
            datos frente a accesos no autorizados, pérdida o alteración:
          </p>
          <ul>
            <li>Comunicaciones cifradas mediante HTTPS/TLS en todo momento.</li>
            <li>Autenticación segura con tokens JWT firmados criptográficamente.</li>
            <li>Acceso a datos restringido por roles: cada investigador solo accede a sus propios estudios.</li>
            <li>Base de datos alojada en infraestructura con cifrado en reposo.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>10. Contacto</h2>
          <p>
            Para cualquier consulta relacionada con el tratamiento de tus datos, puedes contactarnos en:{' '}
            <a href="mailto:privacidad@seraphon.io" className={styles.link}>privacidad@seraphon.io</a>
          </p>
        </section>
      </div>
    </div>
  )
}
