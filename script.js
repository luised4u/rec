// LÓGICA DO ARMÁRIO (GAVETAS)
// Seleciona todas as frentes de gaveta
const drawerFronts = document.querySelectorAll('.drawer-front');

if (drawerFronts.length > 0) {
    drawerFronts.forEach(front => {
        front.addEventListener('click', function() {
            // Acha a gaveta pai dessa frente
            const parentDrawer = this.parentElement;
            // Abre ou fecha essa gaveta específica
            parentDrawer.classList.toggle('is-open');
        });
    });
}

// LÓGICA DAS CARTAS (Só roda se existir carta)
const lettersContainer = document.querySelector(".letters");

if (lettersContainer) { 
    // Se achou o container de cartas, roda o script da carta
    const letters = document.querySelectorAll(".letter");
    let zIndexCounter = 1000; 

    letters.forEach((letter, index) => {
      lettersContainer.appendChild(letter);
      letter.style.zIndex = letters.length - index; 

      const center = document.querySelector(".cssletter").offsetWidth / 2 - letter.offsetWidth / 2;
      letter.style.left = `${center}px`;

      function isOverflown(element) {
        return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
      }

      if (!isOverflown(letter)) {
        letter.classList.add("center");
      }
      let offsetX, offsetY;
      
      letter.addEventListener("mousedown", (e) => {
        if (e.target.tagName !== "BUTTON") {
          const rect = e.target.getBoundingClientRect();
          letter.style.position = "fixed";
          letter.style.left = `${rect.left}px`;
          letter.style.top = `${rect.top}px`;
          offsetX = e.clientX - rect.left;
          offsetY = e.clientY - rect.top;
          letter.style.zIndex = zIndexCounter++; 
          
          const moveAt = (posX, posY) => {
            letter.style.left = `${posX - offsetX}px`;
            letter.style.top = `${posY - offsetY}px`;
          };
          const onMouseMove = (moveEvent) => moveAt(moveEvent.clientX, moveEvent.clientY);
          const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };
          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        }
      });
    });

    // Botão de abrir o envelope grande
    const openBtn = document.querySelector("#openEnvelope");
    if(openBtn) {
        openBtn.addEventListener("click", () => {
            document.querySelector(".envelope").classList.add("active");
        });
    }

    // Botões de fechar carta
    const closeButtons = document.querySelectorAll(".closeLetter");
    closeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const letter = e.target.closest(".letter");
        if (letter) {
          letter.style.display = "none";
        }
      });
    });
}

// LÓGICA DE ARRASTAR FOTOS (DRAG & DROP)
const papers = Array.from(document.querySelectorAll('.paper'));

if (papers.length > 0) {
    let highestZ = 100; // Começa alto para ficar acima do fundo

    class Paper {
        holdingPaper = false;
        mouseTouchX = 0;
        mouseTouchY = 0;
        mouseX = 0;
        mouseY = 0;
        prevMouseX = 0;
        prevMouseY = 0;
        velX = 0;
        velY = 0;
        rotation = Math.random() * 30 - 15;
        currentPaperX = 0;
        currentPaperY = 0;
        rotating = false;

        init(paper) {
            // Evento de movimento do mouse (Global)
            document.addEventListener('mousemove', (e) => {
                if(!this.rotating) {
                    this.mouseX = e.clientX;
                    this.mouseY = e.clientY;
                    this.velX = this.mouseX - this.prevMouseX;
                    this.velY = this.mouseY - this.prevMouseY;
                }
                const dirX = e.clientX - this.mouseTouchX;
                const dirY = e.clientY - this.mouseTouchY;
                const dirLength = Math.sqrt(dirX*dirX+dirY*dirY);
                const dirNormalizedX = dirX / dirLength;
                const dirNormalizedY = dirY / dirLength;
                const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
                let degrees = 180 * angle / Math.PI;
                degrees = (360 + Math.round(degrees)) % 360;
                if(this.rotating) {
                    this.rotation = degrees;
                }
                if(this.holdingPaper) {
                    if(!this.rotating) {
                        this.currentPaperX += this.velX;
                        this.currentPaperY += this.velY;
                    }
                    this.prevMouseX = this.mouseX;
                    this.prevMouseY = this.mouseY;
                    
                    // Aplica o movimento
                    // Posição relativa inicial com translate
                    paper.style.transform = `translate(${this.currentPaperX}px, ${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
                }
            });

            // Evento de clique
            paper.addEventListener('mousedown', (e) => {
                if(this.holdingPaper) return;
                this.holdingPaper = true;
                
                // Traz para frente
                paper.style.zIndex = highestZ;
                highestZ += 1;

                if(e.button === 0) { // Botão esquerdo
                    this.mouseTouchX = this.mouseX;
                    this.mouseTouchY = this.mouseY;
                    this.prevMouseX = this.mouseX;
                    this.prevMouseY = this.mouseY;
                }
                if(e.button === 2) { // Botão direito
                    this.rotating = true;
                }
            });

            // Soltar o mouse
            window.addEventListener('mouseup', () => {
                this.holdingPaper = false;
                this.rotating = false;
            });
        }
    }

// Inicializa cada papel
    papers.forEach(paper => {
        const p = new Paper();
        p.init(paper);

        // Se for o convite, centraliza matematicamente
        if (paper.classList.contains('invitation')|| paper.classList.contains('future')) {
            // Puxa metade da largura e altura para trás para ficar bem no meio
            const startX = -(paper.offsetWidth / 2);
            const startY = -(paper.offsetHeight / 2);
            
            p.currentPaperX = startX;
            p.currentPaperY = startY;
            p.rotation = 0; // Começa reto
            
            paper.style.transform = `translate(${startX}px, ${startY}px) rotate(0deg)`;
        } 
        else {
            // Lógica para as fotos (bagunçadas e aleatórias)
            const randomJitterX = Math.random() * 40 - 20; 
            const randomJitterY = Math.random() * 40 - 20;

            const startX = randomJitterX - (paper.offsetWidth / 2);
            const startY = randomJitterY - (paper.offsetHeight / 2);

            p.currentPaperX = startX;
            p.currentPaperY = startY;
            
            paper.style.transform = `translate(${startX}px, ${startY}px) rotateZ(${p.rotation}deg)`;
        }
    });
}