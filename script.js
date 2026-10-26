/**
 * ====================================================================
 * PASTEL GOURMET - SCRIPT PRINCIPAL (JAVASCRIPT VANILLA)
 * ====================================================================
 * Website Oficial - Pastel Gourmet: Crocância, Sabor e Tradição
 * 
 * Funcionalidades implementadas:
 * 1. Rolagem Suave (Smooth Scroll) com compensação de altura do Header
 * 2. Efeito de Scroll no Header (Header Scrolled com fundo opaco)
 * 3. Menu Mobile Hambúrguer (Abertura, fechamento externo e tecla ESC)
 * 4. Filtro Interativo por Categorias no Cardápio (com animações fluidas)
 * 5. Animações de Entrada ao Rolar (Intersection Observer + Stagger Delay)
 * 6. Integração com WhatsApp (Botões fixos, cabeçalho e pedidos diretos)
 * 7. Efeito Parallax Sutil no Hero (Otimizado com requestAnimationFrame)
 * 8. Gerenciamento do Carregamento da Página (Page Loaded State)
 * 9. Animação Progressiva de Contadores Numéricos (Estatísticas)
 * ====================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /**
   * ==================================================================
   * CONFIGURAÇÕES GLOBAIS
   * ==================================================================
   */
  const CONFIG = {
    // Configurações do WhatsApp
    whatsappNumber: '5500000000000',
    whatsappDefaultMsg: 'Olá! Gostaria de fazer um pedido.',

    // Parâmetros de Scroll e Animação
    headerScrollThreshold: 50,       // Pixels para ativar classe .scrolled
    intersectionThreshold: 0.15,     // 15% do elemento visível na viewport
    parallaxSpeed: 0.3,              // Fator multiplicador de velocidade do parallax
    counterDuration: 2000            // Duração da contagem em milissegundos (2s)
  };

  /**
   * ==================================================================
   * 1. ROLAGEM SUAVE (SMOOTH SCROLL)
   * ==================================================================
   * Intercepta cliques em âncoras internas (#id), compensa a altura
   * do header fixo e rola a página suavemente até o elemento alvo.
   */
  const initSmoothScroll = () => {
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"]):not([href="#!"])');
    const header = document.querySelector('header, .header, .navbar');

    anchorLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        const hash = link.getAttribute('href');
        if (!hash || hash === '#') return;

        let targetElement = null;
        try {
          targetElement = document.querySelector(hash);
        } catch (e) {
          // Caso o seletor contenha caracteres especiais não previstos
          targetElement = document.getElementById(hash.substring(1));
        }

        if (targetElement) {
          event.preventDefault();

          // Fecha o menu mobile se estiver aberto
          closeMobileMenu();

          // Calcula a altura atual do cabeçalho fixo
          const headerHeight = header ? header.offsetHeight : 70;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = Math.max(0, targetPosition - headerHeight);

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Atualiza a URL no histórico sem provocar pulo brusco
          if (history.pushState) {
            history.pushState(null, '', hash);
          }
        }
      });
    });
  };

  /**
   * ==================================================================
   * 2. EFEITO DE SCROLL NO HEADER (HEADER SCROLLED)
   * ==================================================================
   * Adiciona a classe 'scrolled' ao elemento header quando o usuário
   * rola mais de 50px na vertical, ativando fundo opaco e sombra.
   */
  const initHeaderScroll = () => {
    const header = document.querySelector('header, .header, .navbar');
    if (!header) return;

    let isScrolling = false;

    const checkHeaderState = () => {
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;

      if (currentScrollY > CONFIG.headerScrollThreshold) {
        if (!header.classList.contains('scrolled')) {
          header.classList.add('scrolled');
        }
      } else {
        if (header.classList.contains('scrolled')) {
          header.classList.remove('scrolled');
        }
      }

      isScrolling = false;
    };

    // Otimização de performance com passive event listener e requestAnimationFrame
    window.addEventListener('scroll', () => {
      if (!isScrolling) {
        window.requestAnimationFrame(checkHeaderState);
        isScrolling = true;
      }
    }, { passive: true });

    // Verificação inicial caso a página recarregue já rolada
    checkHeaderState();
  };

  /**
   * ==================================================================
   * 3. MENU MOBILE HAMBÚRGUER
   * ==================================================================
   * Controla a abertura e fechamento do menu em dispositivos móveis:
   * - Alterna classe 'active' no botão, no menu e no body (bloqueio de scroll)
   * - Fecha ao clicar em um link interno
   * - Fecha ao clicar fora do menu
   * - Fecha com a tecla ESC para acessibilidade
   */
  const getMobileElements = () => {
    const toggleBtn = document.querySelector('.menu-toggle, #menu-toggle, [data-menu-toggle]');
    const navMenu = document.querySelector('.nav-menu, nav.nav-menu, .nav-links');
    return { toggleBtn, navMenu };
  };

  const closeMobileMenu = () => {
    const { toggleBtn, navMenu } = getMobileElements();

    if (toggleBtn && toggleBtn.classList.contains('active')) {
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }

    if (navMenu && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
    }

    if (document.body.classList.contains('active')) {
      document.body.classList.remove('active');
    }
  };

  const initMobileMenu = () => {
    const { toggleBtn, navMenu } = getMobileElements();
    if (!toggleBtn || !navMenu) return;

    // Define acessibilidade inicial ARIA
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Alternar menu de navegação');

    // Clique no botão de alternância (Hambúrguer <-> X)
    toggleBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const isCurrentlyActive = toggleBtn.classList.contains('active');
      const nextState = !isCurrentlyActive;

      toggleBtn.classList.toggle('active', nextState);
      navMenu.classList.toggle('active', nextState);
      document.body.classList.toggle('active', nextState);

      toggleBtn.setAttribute('aria-expanded', String(nextState));
    });

    // Fecha o menu ao clicar em qualquer link de navegação
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Fecha o menu ao clicar fora do container do menu ou do botão
    document.addEventListener('click', (event) => {
      if (!toggleBtn.classList.contains('active')) return;

      const clickInsideNav = navMenu.contains(event.target);
      const clickOnToggle = toggleBtn.contains(event.target);

      if (!clickInsideNav && !clickOnToggle) {
        closeMobileMenu();
      }
    });

    // Fecha o menu ao pressionar a tecla ESC (acessibilidade teclado)
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggleBtn.classList.contains('active')) {
        closeMobileMenu();
      }
    });

    // Fecha o menu se a janela for redimensionada para desktop (> 992px)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 992 && toggleBtn.classList.contains('active')) {
        closeMobileMenu();
      }
    });
  };

  /**
   * ==================================================================
   * 4. FILTRO DE CATEGORIAS DO CARDÁPIO
   * ==================================================================
   * Filtra os itens do cardápio (.menu-card) conforme a categoria
   * selecionada (.category-btn), animando a transição de visibilidade.
   */
  const initMenuFilter = () => {
    const categoryButtons = document.querySelectorAll('.category-btn, [data-category-btn]');
    const menuCards = document.querySelectorAll('.menu-card');

    if (categoryButtons.length === 0 || menuCards.length === 0) return;

    // Garante estilo base de transição suave em todos os cards
    menuCards.forEach(card => {
      card.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Se já estiver ativo, não faz nada
        if (button.classList.contains('active')) return;

        // Atualiza estado visual ativo nos botões
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const selectedCategory = (button.getAttribute('data-category') || 'todos').toLowerCase().trim();

        // Itera sobre todos os cards do cardápio aplicando a filtragem
        menuCards.forEach(card => {
          const cardCategory = (card.getAttribute('data-category') || '').toLowerCase().trim();
          const matches = (selectedCategory === 'todos' || selectedCategory === 'all' || cardCategory === selectedCategory);

          if (matches) {
            // Reexibe o card no fluxo do documento
            card.style.display = '';
            
            // Força reflow para garantir a animação suave de entrada
            void card.offsetWidth;

            window.requestAnimationFrame(() => {
              card.classList.remove('filtered-out', 'hide', 'hidden');
              card.classList.add('visible', 'show');
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
              card.style.pointerEvents = 'auto';
            });
          } else {
            // Animação de saída (fade out e leve redução de escala)
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            card.style.pointerEvents = 'none';

            // Oculta após a animação de saída terminar
            setTimeout(() => {
              if (button.classList.contains('active') && !matches) {
                card.classList.add('filtered-out', 'hide', 'hidden');
                card.classList.remove('visible', 'show');
                card.style.display = 'none';
              }
            }, 300);
          }
        });
      });
    });
  };

  /**
   * ==================================================================
   * 5. ANIMAÇÕES DE SCROLL (INTERSECTION OBSERVER)
   * ==================================================================
   * Observa elementos com a classe 'animate-on-scroll'. Ao entrarem na
   * viewport (threshold: 0.15), adiciona a classe 'visible' e aplica
   * delay escalonado (stagger) para elementos filhos com data-delay.
   */
  const initScrollAnimations = () => {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    // Fallback gracioso para navegadores que não suportam IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      animatedElements.forEach(el => el.classList.add('visible'));
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: CONFIG.intersectionThreshold
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;

          // Aplica delay no próprio elemento se houver data-delay
          const elementDelay = target.getAttribute('data-delay');
          if (elementDelay) {
            const formatted = elementDelay.endsWith('ms') || elementDelay.endsWith('s') 
              ? elementDelay 
              : `${elementDelay}ms`;
            target.style.transitionDelay = formatted;
            target.style.animationDelay = formatted;
          }

          // Trata animações em cascata (stagger) para filhos com data-delay
          const staggeredChildren = target.querySelectorAll('[data-delay]');
          staggeredChildren.forEach(child => {
            const childDelay = child.getAttribute('data-delay');
            if (childDelay) {
              const formattedChild = childDelay.endsWith('ms') || childDelay.endsWith('s') 
                ? childDelay 
                : `${childDelay}ms`;
              child.style.transitionDelay = formattedChild;
              child.style.animationDelay = formattedChild;
            }
          });

          // Ativa a animação adicionando a classe 'visible'
          target.classList.add('visible');

          // Remove observação para executar apenas uma vez (desempenho ideal)
          observer.unobserve(target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(element => {
      scrollObserver.observe(element);
    });
  };

  /**
   * ==================================================================
   * 6. INTEGRAÇÃO COM WHATSAPP
   * ==================================================================
   * Configura links e botões de atendimento via WhatsApp:
   * - Número padrão: 5500000000000
   * - Mensagem codificada com encodeURIComponent
   * - Suporta pedidos específicos por item do cardápio
   */
  const initWhatsAppButtons = () => {
    const phone = CONFIG.whatsappNumber;
    const defaultText = CONFIG.whatsappDefaultMsg;
    const defaultEncodedUrl = `https://wa.me/${phone}?text=${encodeURIComponent(defaultText)}`;

    // 1. Botões gerais de WhatsApp (header, hero, botão flutuante, footer)
    const whatsappElements = document.querySelectorAll(
      '.whatsapp-btn, .btn-whatsapp, [data-whatsapp], a[href*="wa.me"], a[href*="whatsapp"], .floating-whatsapp, #whatsapp-btn'
    );

    whatsappElements.forEach(element => {
      if (element.tagName === 'A') {
        const currentHref = element.getAttribute('href') || '';
        // Atualiza se for o placeholder padrão ou não tiver mensagem definida
        if (!currentHref || currentHref === '#' || currentHref.includes('5500000000000') || !currentHref.includes('text=')) {
          element.setAttribute('href', defaultEncodedUrl);
        }
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
      } else {
        // Para elementos <button> ou <div> estilizados
        element.style.cursor = 'pointer';
        element.addEventListener('click', (e) => {
          e.preventDefault();
          window.open(defaultEncodedUrl, '_blank', 'noopener,noreferrer');
        });
      }
    });

    // 2. Botões de pedido específicos nos cards do cardápio
    const orderButtons = document.querySelectorAll(
      '.menu-card .order-btn, .menu-card .btn-order, .menu-card .btn-pedir, .menu-card [data-order], .btn-card-order'
    );

    orderButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        const card = button.closest('.menu-card');
        let itemName = '';

        if (card) {
          const titleElement = card.querySelector('.menu-title, .card-title, h3, h4, .pastel-title');
          if (titleElement) {
            itemName = titleElement.textContent.trim();
          }
        }

        // Se o botão contiver atributo explícito data-pastel ou data-item
        if (!itemName) {
          itemName = button.getAttribute('data-pastel') || button.getAttribute('data-item') || '';
        }

        const customMessage = itemName 
          ? `Olá! Gostaria de fazer um pedido: *${itemName}*.`
          : defaultText;

        const customUrl = `https://wa.me/${phone}?text=${encodeURIComponent(customMessage)}`;

        if (button.tagName === 'A') {
          button.setAttribute('href', customUrl);
          button.setAttribute('target', '_blank');
          button.setAttribute('rel', 'noopener noreferrer');
        } else {
          event.preventDefault();
          window.open(customUrl, '_blank', 'noopener,noreferrer');
        }
      });
    });
  };

  /**
   * ==================================================================
   * 7. EFEITO PARALLAX SUTIL NO HERO
   * ==================================================================
   * Move ligeiramente a imagem ou camada de fundo da seção Hero durante
   * o scroll para criar profundidade visual sem prejudicar o desempenho.
   */
  const initHeroParallax = () => {
    const heroSection = document.querySelector('.hero, #hero, .hero-section');
    if (!heroSection) return;

    // Busca camada de fundo dedicada ou a própria seção
    const heroBg = heroSection.querySelector('.hero-bg, .hero-background, .hero-image, .hero-img, .parallax-bg');

    let isParallaxTicking = false;

    const renderParallax = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const heroHeight = heroSection.offsetHeight;

      // Executa apenas enquanto a seção Hero estiver visível na tela
      if (scrollY <= heroHeight) {
        const offset = scrollY * CONFIG.parallaxSpeed;

        if (heroBg) {
          heroBg.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
        } else {
          // Ajusta a posição de fundo CSS diretamente caso não haja elemento filho
          heroSection.style.backgroundPositionY = `calc(50% + ${(offset * 0.4).toFixed(1)}px)`;
        }
      }

      isParallaxTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!isParallaxTicking) {
        window.requestAnimationFrame(renderParallax);
        isParallaxTicking = true;
      }
    }, { passive: true });

    // Renderização inicial
    renderParallax();
  };

  /**
   * ==================================================================
   * 8. CARREGAMENTO DA PÁGINA (PAGE LOAD)
   * ==================================================================
   * Adiciona a classe 'loaded' ao <body> após o carregamento do DOM
   * e dispara animações iniciais dos elementos visíveis acima da dobra.
   */
  const initPageLoad = () => {
    // Adiciona classe 'loaded' ao body
    document.body.classList.add('loaded');

    // Atualiza o ano no rodapé automaticamente se houver elemento específico
    const yearElements = document.querySelectorAll('#year, .current-year, [data-year]');
    const currentYear = new Date().getFullYear();
    yearElements.forEach(el => {
      el.textContent = currentYear;
    });

    // Dispara checagem inicial de animações para elementos acima da dobra
    setTimeout(() => {
      const initialElements = document.querySelectorAll('.hero .animate-on-scroll, #hero .animate-on-scroll');
      initialElements.forEach(el => el.classList.add('visible'));
    }, 100);
  };

  /**
   * ==================================================================
   * 9. ANIMAÇÃO DE CONTADORES NUMÉRICOS (ESTATÍSTICAS)
   * ==================================================================
   * Anima números de 0 até o valor final quando a seção de estatísticas
   * se torna visível na viewport (suporta prefixos, sufixos e decimais).
   */
  const initCounterAnimation = () => {
    const counterElements = document.querySelectorAll(
      '.stat-number, .counter, .stat-counter, [data-counter], [data-target]'
    );

    if (counterElements.length === 0) return;

    // Função de interpolação com desaceleração natural (ease-out)
    const easeOutQuad = (t) => t * (2 - t);

    const animateNumber = (element) => {
      // Valor alvo definido por data-target, data-counter ou texto interno
      const rawValue = element.getAttribute('data-target') || 
                        element.getAttribute('data-counter') || 
                        element.getAttribute('data-count') || 
                        element.textContent.trim();

      // Expressão regular para isolar prefixo, número e sufixo (ex: "+15 mil", "99.8%", "10 anos")
      const regex = /^([^\d]*)([\d.,]+)([^\d]*)$/;
      const match = rawValue.match(regex);

      if (!match) return;

      const prefix = match[1] || '';
      const rawNumber = match[2];
      const suffix = match[3] || '';

      // Normaliza formatos com vírgula ou ponto decimal
      const isDecimal = rawNumber.includes(',') || (rawNumber.includes('.') && rawNumber.split('.')[1].length <= 2);
      const normalizedString = rawNumber.replace(/\./g, '').replace(',', '.');
      const targetValue = parseFloat(normalizedString);

      if (isNaN(targetValue)) return;

      const startTime = performance.now();
      const duration = CONFIG.counterDuration;

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuad(progress);
        const currentNumber = easedProgress * targetValue;

        let formattedOutput;
        if (isDecimal) {
          formattedOutput = currentNumber.toFixed(1).replace('.', ',');
        } else {
          formattedOutput = Math.floor(currentNumber).toLocaleString('pt-BR');
        }

        element.textContent = `${prefix}${formattedOutput}${suffix}`;

        if (progress < 1) {
          window.requestAnimationFrame(updateCounter);
        } else {
          // Fixa o valor final com precisão total
          const finalOutput = isDecimal
            ? targetValue.toFixed(1).replace('.', ',')
            : targetValue.toLocaleString('pt-BR');
          element.textContent = `${prefix}${finalOutput}${suffix}`;
        }
      };

      window.requestAnimationFrame(updateCounter);
    };

    // Aciona a contagem com Intersection Observer quando visível
    if ('IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateNumber(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });

      counterElements.forEach(counter => counterObserver.observe(counter));
    } else {
      counterElements.forEach(counter => animateNumber(counter));
    }
  };

  /**
   * ==================================================================
   * INICIALIZAÇÃO DE TODOS OS MÓDULOS
   * ==================================================================
   */
  const initApp = () => {
    initPageLoad();
    initSmoothScroll();
    initHeaderScroll();
    initMobileMenu();
    initMenuFilter();
    initScrollAnimations();
    initWhatsAppButtons();
    initHeroParallax();
    initCounterAnimation();
  };

  // Disparo da aplicação
  initApp();

});
