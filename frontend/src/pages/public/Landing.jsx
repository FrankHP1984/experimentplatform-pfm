import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAuthContext } from '../../context/AuthContext'
import styles from './Landing.module.css'

// ─── Scroll fade-in hook ──────────────────────────────────────
function useFadeIn() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add(styles.visible) },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

// ─── Auth Modal ───────────────────────────────────────────────
function AuthModal({ isOpen, initialTab, onClose }) {
  const [tab, setTab]                 = useState(initialTab)
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [institution, setInstitution] = useState('')
  const { login, register, loading, error, clearError } = useAuth()

  useEffect(() => { setTab(initialTab) }, [initialTab])
  useEffect(() => { if (!isOpen) { clearError(); setEmail(''); setPassword(''); setName(''); setInstitution('') } }, [isOpen])

  if (!isOpen) return null

  const handleOverlay = (e) => { if (e.target === e.currentTarget) onClose() }

  const handleSignup = async (e) => {
    e.preventDefault()
    await register({ email, password, name, institution })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    await login({ email, password })
  }

  return (
    <div className={styles.modalOverlay} onClick={handleOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>
              {tab === 'signup' ? 'Únete a Seraphon' : 'Bienvenido de nuevo'}
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose}>&#x00D7;</button>
        </div>
        <p className={styles.modalSubtitle}>
          {tab === 'signup'
            ? 'Crea tu cuenta de investigador de forma gratuita.'
            : 'Accede a tu panel de investigación.'}
        </p>

        <div className={styles.modalTabs}>
          <button
            className={`${styles.modalTab} ${tab === 'signup' ? styles.modalTabActive : ''}`}
            onClick={() => setTab('signup')}
          >Registrarse</button>
          <button
            className={`${styles.modalTab} ${tab === 'login' ? styles.modalTabActive : ''}`}
            onClick={() => setTab('login')}
          >Iniciar sesión</button>
        </div>

        {error && <div className={styles.formError}>{error}</div>}

        {tab === 'signup' ? (
          <form onSubmit={handleSignup}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nombre completo</label>
              <input className={styles.formInput} type="text" placeholder="Dra. Elena Montiel" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email institucional</label>
              <input className={styles.formInput} type="email" placeholder="nombre@universidad.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Contraseña</label>
              <input className={styles.formInput} type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Institución / Universidad</label>
              <input className={styles.formInput} type="text" placeholder="Instituto Veltris de Ciencias del Comportamiento" value={institution} onChange={(e) => setInstitution(e.target.value)} />
            </div>
            <button className={styles.btnFilled} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratuita →'}
            </button>
            <p className={styles.formLegal}>
              Al registrarte aceptas nuestros <span className={styles.linkViolet}>Términos de uso</span> y <span className={styles.linkViolet}>Política de privacidad</span>.
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <input className={styles.formInput} type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Contrasena</label>
              <input className={styles.formInput} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className={styles.forgotRow}>
              <span className={styles.linkViolet}>¿Olvidaste tu contraseña?</span>
            </div>
            <button className={styles.btnFilled} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Landing Page ─────────────────────────────────────────────
export default function Landing() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab]   = useState('signup')
  const { user, isAuthenticated, logout } = useAuthContext()
  const navigate = useNavigate()

  const openModal = (tab) => { setModalTab(tab); setModalOpen(true) }
  const closeModal = () => setModalOpen(false)

  const handleLogout = async () => {
    await logout()
  }

  const goToDashboard = () => {
    const dest = user?.role === 'PARTICIPANT' ? '/participant/dashboard' : '/dashboard'
    navigate(dest)
  }

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const heroLeftRef  = useFadeIn()
  const statsRef     = useFadeIn()
  const featuresRef  = useFadeIn()
  const howRef       = useFadeIn()
  const whyRef       = useFadeIn()
  const plansRef     = useFadeIn()
  const aboutRef     = useFadeIn()
  const contactRef   = useFadeIn()

  return (
    <div className={styles.page}>

      {/* ─── NAV ─── */}
      <nav className={styles.nav}>
        <a href="#" className={styles.navLogo}>
          <div className={styles.navLogoIcon}>S</div>
          <span className={styles.navLogoText}>Seraph<span>on</span></span>
        </a>
        <ul className={styles.navLinks}>
          <li><button onClick={() => scrollTo('que-hacemos')}>Qué hacemos</button></li>
          <li><button onClick={() => scrollTo('como-funciona')}>Cómo funciona</button></li>
          <li><button onClick={() => scrollTo('planes')}>Planes</button></li>
          <li><button onClick={() => scrollTo('contacto')}>Contacto</button></li>
        </ul>
        <div className={styles.navActions}>
          {isAuthenticated && user ? (
            <>
              <button className={styles.btnGhost} onClick={handleLogout}>Cerrar sesión</button>
              <button className={styles.btnPrimary} onClick={goToDashboard}>Ir al panel →</button>
            </>
          ) : (
            <>
              <button className={styles.btnGhost} onClick={() => openModal('login')}>Acceder</button>
              <button className={styles.btnPrimary} onClick={() => openModal('signup')}>Registrarse gratis</button>
            </>
          )}
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className={styles.hero} id="hero">
        <div className={styles.heroInner}>
          <div className={`${styles.fadeIn}`} ref={heroLeftRef}>
            <div className={styles.heroTag}>
              <span className={styles.heroTagDot} />
              Plataforma de investigación
            </div>
            <h1 className={styles.heroTitle}>
              Diseña estudios.<br />
              Recoge datos.<br />
              <span className={styles.heroHighlight}>Haz ciencia.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Seraphon es la plataforma que permite a investigadores diseñar experimentos estructurados,
              gestionar participantes y recoger datos de forma rigurosa — sin fricción técnica.
            </p>
            <div className={styles.heroCtas}>
              <button className={`${styles.btnLg} ${styles.btnViolet}`} onClick={() => openModal('signup')}>
                Empieza gratis →
              </button>
              <button className={`${styles.btnLg} ${styles.btnOutline}`} onClick={() => scrollTo('como-funciona')}>
                Ver cómo funciona
              </button>
            </div>
            <p className={styles.heroNote}>
              <span>Sin tarjeta de crédito.</span> Gratis para el plan investigador individual.
            </p>
          </div>

        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className={styles.statsSection} id="stats">
        <div className={styles.container}>
          <div className={`${styles.fadeIn} ${styles.statsGrid}`} ref={statsRef}>
            {[
              { pre: '', num: '100', post: '%', label: 'Gratuito durante el periodo beta' },
              { pre: '', num: '0',   post: '€', label: 'Coste actual para investigadores' },
              { pre: '', num: '99',  post: '%', label: 'Disponibilidad del servicio' },
              { pre: '', num: '0',   post: '',  label: 'Datos vendidos a terceros' },
            ].map(({ pre, num, post, label }) => (
              <div key={label} className={styles.statItem}>
                <div className={styles.statValue}>{pre}<span>{num}</span>{post}</div>
                <div className={styles.statLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── QUE HACEMOS ─── */}
      <section className={styles.section} id="que-hacemos">
        <div className={styles.container}>
          <div className={`${styles.fadeIn}`} ref={featuresRef}>
            <div className={styles.sectionTag}>⬡ Qué hacemos</div>
            <h2 className={styles.sectionTitle}>Una plataforma completa<br />para la investigación moderna</h2>
            <p className={styles.sectionSubtitle}>Desde el diseño del protocolo hasta la exportación de datos, Seraphon gestiona cada etapa de tu estudio.</p>
          </div>
          <div className={styles.featuresGrid}>
            {[
              { color: 'violet', label: 'I',   title: 'Diseño experimental estructurado', desc: 'Define el tipo de diseño — pretest-postest, entre sujetos o longitudinal — y estructura las fases y grupos de tu estudio con precisión metodológica.' },
              { color: 'cyan',   label: 'II',  title: 'Cuestionarios dinámicos',           desc: 'Crea formularios con preguntas de texto, escala, opción múltiple, numéricas o booleanas. Cada fase puede tener su propio conjunto de preguntas.' },
              { color: 'mixed',  label: 'III', title: 'Gestión de participantes',          desc: 'Invita participantes mediante enlace único. Asignalos a grupos de forma manual o automática y monitoriza su progreso en tiempo real.' },
              { color: 'violet', label: 'IV',  title: 'Recogida de datos rigurosa',        desc: 'Valida el tipo de cada respuesta automáticamente. Los datos se almacenan con trazabilidad completa: participante, fase, fecha y grupo.' },
              { color: 'cyan',   label: 'V',   title: 'Exportación a CSV',                 desc: 'Descarga todos los datos de tu experimento en formato CSV, listo para importar en SPSS, R, Python o cualquier herramienta de análisis.' },
              { color: 'mixed',  label: 'VI',  title: 'Seguridad y control de acceso',     desc: 'Autenticación robusta con control de roles. Solo el investigador propietario puede acceder a los datos de su experimento.' },
            ].map(({ color, label, title, desc }) => (
              <div key={title} className={styles.featureCard}>
                <div className={`${styles.featureIcon} ${styles[`fi_${color}`]}`}>{label}</div>
                <div className={styles.featureTitle}>{title}</div>
                <div className={styles.featureDesc}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─── */}
      <section className={styles.sectionGradient} id="como-funciona">
        <div className={styles.container}>
          <div className={`${styles.fadeIn}`} ref={howRef}>
            <div className={styles.sectionTag}>⬡ Cómo funciona</div>
            <h2 className={styles.sectionTitle}>De la hipótesis<br />a los datos en minutos</h2>
          </div>
          <div className={styles.howInner}>
            <div className={styles.steps}>
              {[
                { n: '1', title: 'Crea tu experimento',                  desc: 'Define el título, tipo de diseño y fechas. El experimento empieza en borrador — puedes configurarlo antes de activarlo.' },
                { n: '2', title: 'Configura fases, grupos y preguntas',  desc: 'Estructura tu protocolo: crea fases temporales, define grupos de participantes y diseña los cuestionarios de cada fase.' },
                { n: '3', title: 'Invita a los participantes',            desc: 'Genera un enlace único de invitación. Los participantes rellenan sus datos y quedan inscritos al estudio directamente.' },
                { n: '4', title: 'Recoge y exporta los datos',            desc: 'Monitoriza las respuestas en tiempo real. Cuando el estudio termina, exporta todo a CSV y analiza con tus herramientas habituales.' },
              ].map(({ n, title, desc }, i, arr) => (
                <div key={n}>
                  <div className={styles.step}>
                    <div className={styles.stepNum}>{n}</div>
                    <div>
                      <div className={styles.stepTitle}>{title}</div>
                      <div className={styles.stepDesc}>{desc}</div>
                    </div>
                  </div>
                  {i < arr.length - 1 && <div className={styles.stepConnector} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── POR QUE ─── */}
      <section className={styles.section} id="por-que">
        <div className={styles.container}>
          <div className={`${styles.fadeIn}`} ref={whyRef}>
            <div className={styles.sectionTag}>⬡ Por qué Seraphon</div>
            <h2 className={styles.sectionTitle}>Construida por y para<br />investigadores</h2>
            <p className={styles.sectionSubtitle}>No es una herramienta de encuestas genérica. Seraphon está diseñada entendiendo la lógica del método científico.</p>
          </div>
          <div className={styles.reasonsGrid}>
            {[
              { sym: '◎', title: 'Diseño metodológico real',                desc: 'Soporta los principales diseños experimentales usados en ciencias del comportamiento, educación y salud.' },
              { sym: '◈', title: 'Sin fricción para los participantes',      desc: 'Los participantes acceden mediante un enlace, sin necesidad de crear una cuenta previa. La experiencia es fluida y clara.' },
              { sym: '◇', title: 'Formularios configurables por experimento', desc: 'El investigador define qué datos recoger en cada fase. Los cuestionarios se adaptan al diseño del estudio, no al revés.' },
              { sym: '▷', title: 'Datos listos para analizar',               desc: 'Exportación a CSV estructurado compatible con SPSS, R, Python y Excel desde el primer clic.' },
            ].map(({ sym, title, desc }) => (
              <div key={title} className={styles.reasonCard}>
                <div className={styles.reasonIcon}>{sym}</div>
                <div>
                  <div className={styles.reasonTitle}>{title}</div>
                  <div className={styles.reasonDesc}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLANES ─── */}
      <section className={styles.sectionVioletTint} id="planes">
        <div className={styles.container}>
          <div className={`${styles.fadeIn} ${styles.textCenter}`} ref={plansRef}>
            <div className={`${styles.sectionTag} ${styles.tagCenter}`}>⬡ Planes</div>
            <h2 className={styles.sectionTitle}>Actualmente gratuito.<br />Planes de pago, próximamente.</h2>
            <p className={`${styles.sectionSubtitle} ${styles.subtitleCenter}`}>Durante la fase beta, Seraphon es completamente gratuita. Los planes de pago llegarán más adelante — te avisaremos con tiempo.</p>
          </div>
          <div className={styles.plansGrid}>
            <div className={`${styles.planCard} ${styles.planCardFeatured}`}>
              <div className={styles.planBadge}>Plan actual</div>
              <div className={styles.planName}>Gratuito</div>
              <div className={styles.planPrice}>0€ <span>/ mes</span></div>
              <div className={styles.planDesc}>Acceso completo durante la fase beta, sin límites artificiales ni tarjeta de crédito.</div>
              <div className={styles.planDivider} />
              <ul className={styles.planFeatures}>
                {['Hasta 3 experimentos activos', 'Hasta 50 participantes por experimento', 'Todos los tipos de pregunta', 'Exportación a CSV', 'Invitaciones por enlace'].map(f => <li key={f}>{f}</li>)}
                {['Análisis estadístico básico', 'Colaboración en equipo', 'Soporte prioritario'].map(f => <li key={f} className={styles.planFeatDisabled}>{f}</li>)}
              </ul>
              <button className={`${styles.btnPlan} ${styles.btnPlanOutline}`} onClick={() => openModal('signup')}>Empezar gratis</button>
            </div>

            <div className={styles.planCard}>
              <div className={styles.planBadge}>Proximamente</div>
              <div className={styles.planName}>Researcher</div>
              <div className={styles.planPrice}>— <span>/ mes</span></div>
              <div className={styles.planDesc}>Para investigadores activos con estudios más grandes y complejos.</div>
              <div className={styles.planDivider} />
              <ul className={styles.planFeatures}>
                {['Experimentos ilimitados', 'Participantes ilimitados', 'Todos los tipos de pregunta', 'Exportación a CSV', 'Invitaciones por enlace y email', 'Análisis estadístico básico'].map(f => <li key={f}>{f}</li>)}
                {['Colaboración en equipo', 'Soporte prioritario'].map(f => <li key={f} className={styles.planFeatDisabled}>{f}</li>)}
              </ul>
              <button className={`${styles.btnPlan} ${styles.btnPlanGhost}`} disabled>Disponible pronto</button>
            </div>

            <div className={styles.planCard}>
              <div className={styles.planBadge}>Proximamente</div>
              <div className={styles.planName}>Institution</div>
              <div className={styles.planPrice}>A medida</div>
              <div className={styles.planDesc}>Para universidades, centros de investigación y equipos multidisciplinares.</div>
              <div className={styles.planDivider} />
              <ul className={styles.planFeatures}>
                {['Todo del plan Researcher', 'Múltiples investigadores', 'Roles y permisos por equipo', 'Exportación avanzada', 'Análisis estadístico completo', 'Integración con sistemas externos', 'Soporte dedicado', 'SLA garantizado'].map(f => <li key={f}>{f}</li>)}
              </ul>
              <button className={`${styles.btnPlan} ${styles.btnPlanGhost}`} disabled>Disponible pronto</button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOBRE NOSOTROS ─── */}
      <section className={styles.section} id="sobre-nosotros">
        <div className={styles.container}>
          <div className={styles.aboutInner}>
            <div className={`${styles.fadeIn} ${styles.aboutText}`} ref={aboutRef}>
              <div className={styles.sectionTag}>⬡ Sobre nosotros</div>
              <h2 className={styles.sectionTitle}>Un proyecto<br />de la Universidad Alfonso X el Sabio</h2>
              <p className={styles.aboutPara}>Seraphon es un proyecto de fin de módulo desarrollado en la Universidad Alfonso X el Sabio, nacido con el objetivo de abordar una problemática real en el ámbito de la investigación científica: la falta de herramientas accesibles y específicamente diseñadas para la metodología experimental.</p>
              <p className={styles.aboutPara}>La motivación detrás de este proyecto surge de observar cómo muchos investigadores, especialmente en etapas formativas, se enfrentan a la necesidad de diseñar y ejecutar estudios experimentales con herramientas inadecuadas — formularios genéricos, hojas de cálculo manuales o sistemas complejos pensados para grandes empresas. Seraphon busca democratizar el acceso a metodologías rigurosas, facilitando que cualquier investigador pueda diseñar experimentos estructurados, gestionar participantes y recoger datos con la precisión que la ciencia exige.</p>
              <div className={styles.aboutValues}>
                {['Proyecto académico UAX', 'Enfoque metodológico riguroso', 'Diseño experimental estructurado', 'Accesible para investigadores'].map(v => (
                  <div key={v} className={styles.aboutValue}>{v}</div>
                ))}
              </div>
            </div>
            <div className={`${styles.fadeIn} ${styles.aboutStats}`} style={{ transitionDelay: '0.2s' }}>
              {[
                { val: 'UAX', sup: '', label: 'Universidad' },
                { val: '2026', sup: '', label: 'Año de desarrollo' },
                { val: 'Fin de', sup: '', label: 'Tipo de proyecto' },
                { val: 'Módulo', sup: '', label: 'Académico' },
              ].map(({ val, sup, label }) => (
                <div key={label} className={styles.aboutStatCard}>
                  <div className={styles.aboutStatValue}>{val}<span>{sup}</span></div>
                  <div className={styles.aboutStatLabel}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACTO ─── */}
      <section className={styles.sectionContactTint} id="contacto">
        <div className={styles.container}>
          <div className={styles.contactInner}>
            <div className={`${styles.fadeIn} ${styles.contactInfo}`} ref={contactRef}>
              <div className={styles.sectionTag}>⬡ Contacto</div>
              <h2 className={styles.sectionTitle}>¿Hablamos?</h2>
              <p className={styles.contactInfoPara}>Si tienes preguntas sobre la plataforma, quieres un plan institucional o simplemente quieres compartir tu caso de uso, estamos aqui.</p>
              {[
                { icon: '@', text: 'hola@seraphon.io' },
                { icon: '#', text: 'Disponible para instituciones académicas en toda España y Latinoamérica' },
                { icon: '~', text: 'Respondemos en menos de 24h en días laborables' },
              ].map(({ icon, text }) => (
                <div key={text} className={styles.contactDetail}>
                  <div className={styles.contactDetailIcon}>{icon}</div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <div className={`${styles.fadeIn}`} style={{ transitionDelay: '0.2s' }}>
              <div className={styles.contactForm}>
                <div className={styles.formGroup}><label className={styles.formLabel}>Nombre</label><input className={styles.formInput} type="text" placeholder="Tu nombre completo" /></div>
                <div className={styles.formGroup}><label className={styles.formLabel}>Email institucional</label><input className={styles.formInput} type="email" placeholder="nombre@universidad.edu" /></div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sobre qué nos escribes</label>
                  <select className={styles.formInput}>
                    <option value="">Selecciona un tema...</option>
                    <option>Plan institucional</option>
                    <option>Soporte técnico</option>
                    <option>Propuesta de colaboración</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div className={styles.formGroup}><label className={styles.formLabel}>Mensaje</label><textarea className={`${styles.formInput} ${styles.textarea}`} placeholder="Cuéntanos tu caso de uso o pregunta..." /></div>
                <button className={styles.btnFilled}>Enviar mensaje</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.navLogo}>
                <div className={styles.navLogoIcon}>S</div>
                <span className={styles.navLogoText}>Seraph<span>on</span></span>
              </div>
              <p className={styles.footerTagline}>Plataforma de investigación científica</p>
            </div>
            <div className={styles.footerCol}>
              <h4>Contacto</h4>
              <ul>
                <li><a href="#contacto">hola@seraphon.io</a></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>Legal</h4>
              <ul>
                <li><a href="/aviso-legal">Aviso Legal</a></li>
                <li><a href="/politica-cookies">Política de Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2026 Seraphon. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* ─── AUTH MODAL ─── */}
      <AuthModal isOpen={modalOpen} initialTab={modalTab} onClose={closeModal} />
    </div>
  )
}
