import { For, onMount } from "solid-js";
import anime from 'animejs';
import Lenis from 'lenis';

class User{
  _id!: string;
  avatar!: string;
  username!: string;
  messageCreateCount!: number;
  messageDeleteCount!: number;
  messageEditCount!: number;
}

let getPlaceString = ( num: number ) => {
  if(num.toString().endsWith('1') && num != 11){
      return 'st'
  } else if(num.toString().endsWith('2') && num != 12){
      return 'nd'
  } else if(num.toString().endsWith('3') && num != 13){
      return 'rd'
  } else{
      return 'th'
  }
}

let App = () => {
  let container: HTMLElement;
  let content: HTMLElement;
  let tableContent: HTMLElement;
  let canvas: HTMLCanvasElement;
  let loadingText: HTMLElement;
  let totalTime: number = 0;
  let loadedTime: number = 0;
  let hasLoaded = false;
  let lenis: Lenis;
  let isLoadingRecords = true;
  let currentBoardPage = 0;
  let countdown: HTMLElement;
  let resetTime: number | null = null;

  let waitForMount = ( cb: () => void ) => {
    return new Promise<void>(( res ) => {
      onMount(() => {
        cb();
        res();
      })
    })
  }

  let waitForRequest = ( url: string ) => {
    return new Promise<User[]>(( res ) => {
      fetch(url)
        .then(data => data.json())
        .then(data => {
          res(data);
        })
    })
  }

  let pfps: HTMLImageElement[] = [];
  let users: User[] = [];

  let particles: Particle[] = [];
  let ctx: CanvasRenderingContext2D;

  class Particle{
    x!: number;
    y!: number;

    render( _ctx: CanvasRenderingContext2D, _canvas: HTMLCanvasElement ){}

    remove(){
      particles = particles.filter(x => x !== this);
    }
  }

  class BackGroundParticle extends Particle{
    img: HTMLImageElement;
    hasLoaded: boolean = false;

    frames: number;

    velX!: number;
    velY!: number;

    constructor( canvas: HTMLCanvasElement ){
      super();

      this.img = new Image();
      this.img.src = "https://cdn.phaz.uk/transacademy/particle.png";

      this.img.onload = () => this.hasLoaded = true;

      this.frames = 0;

      this.y = Math.random() * canvas.height;
      this.x = Math.random() * canvas.width;

      this.velY = (Math.random() * 10) - 5;
      this.velX = (Math.random() * 10) - 5;
    }

    render( ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement ){
      if(this.hasLoaded){
        this.x += this.velX;
        this.y += this.velY;

        this.frames++;

        ctx.globalAlpha = Math.min(this.frames / 100, 1);
        ctx.drawImage(this.img, this.x - 5, this.y - 5, 10, 10);
        ctx.globalAlpha = 1;

        if(this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height){
          this.remove();

          particles.push(new BackGroundParticle(canvas));
        }
      }
    }
  }

  let drawBanner = ( x: number, y: number, width: number, height: number, triangeHeight: number ) => {
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + (height - triangeHeight));
    ctx.lineTo(x + width / 2, y + height);
    ctx.lineTo(x + width, y + (height - triangeHeight));
    ctx.lineTo(x + width, y);
    ctx.closePath();

    ctx.fill();
    ctx.shadowBlur = 0;
  }

  let drawBannerImage = ( img: HTMLImageElement, x: number, y: number, width: number, height: number, triangeHeight: number ) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + (height - triangeHeight));
    ctx.lineTo(x + width / 2, y + height);
    ctx.lineTo(x + width, y + (height - triangeHeight));
    ctx.lineTo(x + width, y);
    ctx.closePath();

    ctx.save();
    ctx.clip();
    ctx.drawImage(img, x - (height / 2) + ( width / 2 ), y, height, height);
    ctx.restore();
  }

  let getPlace = ( index: number ): number => {
    switch(index){
      case -2.5:
        return 4;
      case -1.5:
        return 2;
      case -0.5:
        return 0;
      case 0.5:
        return 1;
      case 1.5:
        return 3;
      default:
        return 5;
    }
  }

  let render = ( time: number ) => {
    totalTime += time;

    lenis.raf(time);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#020025';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 1;
    particles.forEach(p => p.render(ctx, canvas));

    let yOffest = lenis.actualScroll * 1.25;

    if(hasLoaded){
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 5;

      let drawBannerFull = ( i: number ) => {
        let size = Math.abs(i + 0.5) * 20;
        let place = getPlace(i);

        let fade = Math.max(((totalTime - loadedTime) / 100000) - (size / 250), 0);

        // @ts-ignore
        ctx.letterSpacing = '0px';
        ctx.globalAlpha = Math.min(fade, 0.5);

        drawBanner((canvas.width / 2 + i * 300) + 20, 150 + size / 2 - yOffest, 260, canvas.height - 300 - size, 120);

        ctx.globalAlpha = Math.min(fade, 0.5);

        ctx.fillStyle = '#fff';
        ctx.font = '50px Ethnocentric';
        ctx.fillText((place + 1) + getPlaceString(place + 1), (canvas.width / 2 + i * 300) + 150, 100 - yOffest);

        if(!pfps[place]){
          ctx.font = '10px Ethnocentric';
          ctx.fillText("Loading...", canvas.width / 2 + i * 300 + 150, canvas.height / 2 - yOffest);
        } else{
          ctx.globalAlpha = Math.min(Math.max(fade, 0), 1);
          drawBannerImage(pfps[place], (canvas.width / 2 + i * 300) + 20, 150 + size / 2 - yOffest, 260, canvas.height - 300 - size, 120);
        }

        ctx.fillStyle = '#0009';
        ctx.fillRect((canvas.width / 2 + i * 300) + 20, canvas.height / 2 + 75 - yOffest, 260, 75);

        ctx.fillStyle = '#fff';
        ctx.font = '25px Ethnocentric';

        let nameWidth = ctx.measureText(users[place].username);

        if(nameWidth.width < 250){
          ctx.fillText(users[place].username, canvas.width / 2 + i * 300 + 150, canvas.height / 2 + 100 - yOffest);

          ctx.font = '10px Ethnocentric';
          ctx.fillText("Messages sent: " + users[place].messageCreateCount, canvas.width / 2 + i * 300 + 150, canvas.height / 2 + 130 - yOffest);
        } else{
          let fontSize = 25;

          do {
            ctx.font = `${fontSize -= 1}px Ethnocentric`;
          } while (ctx.measureText(users[place].username).width > 250);

          ctx.fillText(users[place].username, canvas.width / 2 + i * 300 + 150, canvas.height / 2 + 100 - yOffest);

          ctx.font = '10px Ethnocentric';
          ctx.fillText("Messages sent: " + users[place].messageCreateCount, canvas.width / 2 + i * 300 + 150, canvas.height / 2 + 130 - yOffest);
        }
      }

      if(canvas.width > 1600){
        for(let i = -2.5; i < 2.5; i++)
          drawBannerFull(i);
      } else if(canvas.width > 1000){
        for(let i = -1.5; i < 1.5; i++)
          drawBannerFull(i);
      } else if(canvas.width > 500){
        drawBannerFull(-.5);
      }
    }

    if(totalTime < 100000){
      ctx.globalAlpha = Math.min(0.5, Math.max(0, (totalTime / -100000) + 1));
      ctx.fillStyle = '#fff';
      ctx.font = '50px Ethnocentric';

      // @ts-ignore
      ctx.letterSpacing = totalTime / 10000 + 'px';

      ctx.fillText("Loading...", canvas.width / 2, canvas.height / 2);
    }

    if(lenis.progress > 0.95 && !isLoadingRecords){
      loadingText.innerHTML = 'Loading More Records...';
      isLoadingRecords = true;

      currentBoardPage += 1;
      waitForRequest('https://qsup-api.phaz.uk/api/v1/board?page=' + currentBoardPage)
        .then(data => {
          loadingText.innerHTML = '';

          if(data.length != 15){
            loadingText.innerHTML = 'No more records to show.';
          } else{
            setTimeout(() => {
              isLoadingRecords = false;
            }, 1000);
          }

          users.push(...data);

          tableContent.innerHTML = '';
          tableContent.appendChild(<div>
            <For each={users}>
              {((user, index) =>
                <div class="table-row">
                  <div class="small-pfp" style={{ background: 'url(\'https://cdn.discordapp.com/avatars/' + user._id + '/' + user.avatar + '.webp?size=1024\')' }}></div>
                  <div>{ index() + 1 }. { user.username }</div>
                  <div class="small-column">{ user.messageCreateCount }</div>
                  <div class="small-column">{ user.messageDeleteCount }</div>
                  <div class="small-column">{ user.messageEditCount }</div>
                </div>
              )}
            </For>
          </div> as Node);
        })
    }

    requestAnimationFrame(render);
  }

  const font = new FontFace('Ethnocentric', 'url(https://cdn.phaz.uk/fonts/Ethnocentric/ethnocentric%20rg.otf)');

  font.load().then((font) => {
    document.fonts.add(font);

    Promise.all([ waitForRequest('https://qsup-api.phaz.uk/api/v1/board'), waitForMount(() => {
      lenis = new Lenis({
        wrapper: container,
        content
      });

      lenis.scrollTo(0);

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      window.onresize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
  
      for (let i = 0; i < 10; i++) {
        particles.push(new BackGroundParticle(canvas));
      }

      ctx = canvas.getContext("2d")!;

      waitForRequest('https://qsup-api.phaz.uk/api/v1/reset')
        .then((data: any) => {
          resetTime = data.reset;
        })

      requestAnimationFrame(render);
    }) ])
      .then(data => {
        let d = data[0];

        let finalLoad = () => {
          users = d;
          hasLoaded = true;

          tableContent.innerHTML = '';
          tableContent.appendChild(<div>
            <For each={users}>
              {((user, index) =>
                <div class="table-row">
                  <div class="small-pfp" style={{ background: 'url(\'https://cdn.discordapp.com/avatars/' + user._id + '/' + user.avatar + '.webp?size=1024\')' }}></div>
                  <div>{ index() + 1 }. { user.username }</div>
                  <div class="small-column">{ user.messageCreateCount }</div>
                  <div class="small-column">{ user.messageDeleteCount }</div>
                  <div class="small-column">{ user.messageEditCount }</div>
                </div>
              )}
            </For>
          </div> as Node);

          setTimeout(() => {
            isLoadingRecords = false;
          }, 1000);

          anime({
            targets: '.page-corner-top-left',
            top: '50px',
            easing: 'easeInOutQuad',
            duration: 500
          });

          anime({
            targets: '.page-corner-bottom-left',
            bottom: '50px',
            easing: 'easeInOutQuad',
            duration: 500
          });
  
          anime({
            targets: '.page-corner-top-right',
            top: '50px',
            easing: 'easeInOutQuad',
            duration: 500
          });

          anime({
            targets: '.page-corner-bottom-right',
            bottom: '50px',
            easing: 'easeInOutQuad',
            duration: 500
          });

          anime({
            targets: '.table',
            opacity: '1',
            easing: 'easeInOutQuad',
            duration: 500
          });
        }

        loadedTime = totalTime;

        let loadingAmount = 0;

        for (let i = 0; i < 5; i++) {
          if(d[i]){
            let img = new Image();
            img.src = 'https://cdn.discordapp.com/avatars/' + d[i]._id + '/' + d[i].avatar + '.webp?size=1024';

            loadingAmount++;

            img.onload = () => {
              loadingAmount--;

              if(loadingAmount == 0){
                finalLoad();
              }
            }

            pfps.push(img);
          }
        }
      });
  });

  setInterval(() => {
    if(resetTime){
      let diff = resetTime - Date.now();

      if(diff < 0){
        resetTime = null;
        countdown.innerText = "Loading Countdown...";

        waitForRequest('https://qsup-api.phaz.uk/api/v1/reset')
          .then((data: any) => {
            resetTime = data.reset;
          })

        return;
      }

      let d = new Date(diff);

      countdown.innerText = `Reset: ${d.getDate() - 1} Days, ${d.getHours() - 1} Hours, ${d.getMinutes()} Minutes, ${d.getSeconds()} Seconds`;
    }
  }, 500);

  let ws = new WebSocket('wss://qsup-api.phaz.uk/api/v1/live');

  ws.onopen = () => {
    console.log('Connected to server.');
  }

  ws.onmessage = ( msg ) => {
    let d = msg.data.toString().split('|');

    console.log(d);

    let u = users.findIndex(x => x._id === d[2])

    if(u !== -1){
      switch(d[1]){
        case 'DELETE':
          users[u].messageDeleteCount = d[0];
          break;
        case 'CREATE':
          users[u].messageCreateCount = d[0];
          break;
        case 'EDIT':
          users[u].messageEditCount = d[0];
          break;
      }
    }

    tableContent.innerHTML = '';
    tableContent.appendChild(<div>
      <For each={users}>
        {((user, index) =>
          <div class="table-row">
            <div class="small-pfp" style={{ background: 'url(\'https://cdn.discordapp.com/avatars/' + user._id + '/' + user.avatar + '.webp?size=1024\')' }}></div>
            <div>{ index() + 1 }. { user.username }</div>
            <div class="small-column">{ user.messageCreateCount }</div>
            <div class="small-column">{ user.messageDeleteCount }</div>
            <div class="small-column">{ user.messageEditCount }</div>
          </div>
        )}
      </For>
    </div> as Node);
  }

  return (
    <>
      <canvas ref={ ( el ) => canvas = el }></canvas>
      <div class="container" ref={( el ) => container = el}>
        <div class="page-corner-top-left"></div>
        <div class="page-corner-bottom-left"></div>
        <div class="page-corner-top-right"></div>
        <div class="page-corner-bottom-right"></div>

        <div ref={( el ) => content = el}>
          <div class="table-spacer"></div>
          <div class="table">
            <h3 ref={( el ) => countdown = el}>Loading Countdown...</h3>
            <h1>Leaderboard</h1>
            <div class="table-row">
              <div style={{ width: '50px', height: '50px', margin: '-10px' }}></div>
              <div>Name</div>
              <div class="small-column">Sent Messages</div>
              <div class="small-column">Deleted Messages</div>
              <div class="small-column">Edited Messages</div>
            </div>

            <div ref={( el ) => tableContent = el}></div>

            <h3 ref={( el ) => loadingText = el}></h3>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
