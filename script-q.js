(function() {
  // selectors
  const aboutButton = document.querySelector("#about-button");
  const aboutPanel = document.querySelector("#about-panel");

  const mobileAboutButton = document.querySelector("#mobile-about-button");
  const mobileAboutPanel = document.querySelector("#mobile-about");


  const nowPlaying = document.querySelector("#now");
  const nowPlayingMobile = document.querySelector("#now-mobile");
  const mobileStream = document.querySelector("#mobile-stream");
  const mobilePlaceholder = document.querySelector("#mobile-placeholder");
  const desktopStream = document.querySelector("#stream");
  const desktopPlaceholder = document.querySelector("#desktop-placeholder");

  const textSpoofer = document.querySelector("#text-spoofer");
  const panelSpoofer = document.querySelector("#panel-spoofer");


  const scheduleButton = document.querySelector("#schedule-button");
  const schedulePanel = document.querySelector("#schedule-panel");

  const mobileSchedulePanel = document.querySelector("#mobile-schedule-panel");

  const desktopTipButton = document.querySelector("#desktop-tip-button");
  const desktopTipLink = document.querySelector("#desktop-tip-link");
  const mobileTipButton = document.querySelector("#mobile-tip-button");
  const mobileTipLink = document.querySelector("#mobile-tip-link");

  const chatButton = document.querySelector("#chat-button");
  const mobileChatButton = document.querySelector("#mobile-chat-button");
  const chatWindow = document.querySelector("#chat-window");

  const mobileUsercount = document.querySelector("#mobile-user-count");
  const desktopUsercount = document.querySelector("#desktop-user-count");

  // state
  let aboutOpen = false;
  let mobileAboutOpen = false;

  let isLive = null;
  let currentShowName = '';

  let charactersInPanel = 0;

  let scheduleOpen = false;

  let scheduleEvents = [];

  let marqueed = false;

  let chatOpen = false;

  let mobile = true;

  // about

  aboutButton.addEventListener("click", () => {
    if (!aboutOpen) {
      aboutButton.classList.add("button-active");
      aboutPanel.classList.add("panel-active");
      aboutOpen = true;
    } else {
      aboutButton.classList.remove("button-active");
      aboutPanel.classList.remove("panel-active");
      aboutOpen = false;
    }
  });

  mobileAboutButton.addEventListener("click", () => {
    if (!mobileAboutOpen) {
      mobileAboutButton.classList.add("button-active");
      mobileSchedulePanel.classList.add("hidden");
      mobileAboutPanel.classList.remove("hidden");
      mobileAboutOpen = true;
    } else {
      mobileAboutButton.classList.remove("button-active");
      mobileAboutPanel.classList.add("hidden");
      mobileSchedulePanel.classList.remove("hidden");
      mobileAboutOpen = false;
    }
  });

  // schedule

  scheduleButton.addEventListener("click", () => {
    if (!scheduleOpen) {
      scheduleButton.classList.add("button-active");
      schedulePanel.classList.add("panel-active");
      scheduleOpen = true;
    } else {
      scheduleButton.classList.remove("button-active");
      schedulePanel.classList.remove("panel-active");
      scheduleOpen = false;
    }
  });

  // chat

  chatButton.addEventListener("click", () => {
    if (!chatOpen) {
      chatWindow.classList.remove("chat-hidden");
      chatWindow.classList.add("chat-active");
      chatButton.classList.add("button-active");
      chatOpen = true;
    } else {
      chatWindow.classList.add("chat-hidden");
      chatWindow.classList.remove("chat-active");
      chatButton.classList.remove("button-active");
      chatOpen = false;
    }
  });

  mobileChatButton.addEventListener("click", () => {
    if (!chatOpen) {
      chatWindow.classList.remove("chat-hidden");
      chatWindow.classList.add("chat-active");
      chatOpen = true;
    } else {
      chatWindow.classList.add("chat-hidden");
      chatWindow.classList.remove("chat-active");
      chatOpen = false;
    }
  });

  // this can be commented / uncommented out to enable usercount - can comment out elements in index.html

  // const socket = io("https://public-access-backend.herokuapp.com/");

  // socket.on('connect', () => {
  //   console.log('hi');
  // });

  // socket.on("userCount", function(usercount) {
  //   mobileUsercount.innerHTML = String(usercount);
  //   desktopUsercount.innerHTML = String(usercount);
  // });

  function fetchSchedule() {
    fetch("https://public-access-backend.herokuapp.com/")
      .then(data => {
        return data.json();
      })
      .then(schedule => {
        if (!schedule.events) {
          nowPlaying.innerHTML = `<span>OFF AIR</span>`;
          nowPlayingMobile.innerHTML = `<span>OFF AIR</span>`; 
          desktopStream.classList.add("hidden");
          desktopPlaceholder.classList.remove("hidden");
          mobileStream.classList.add("hidden");
          mobilePlaceholder.classList.remove("hidden");
          scheduleEvents = [];
          return;
        }
        scheduleEvents = schedule.events;
        findCurrentAndNextShow(scheduleEvents);
        compileSchedule(scheduleEvents);
      });
  }

  calculateCharactersInPanel();

  fetchSchedule();

  setInterval(fetchSchedule, 5000);

  function debouncedResizeHandler() {
    handleStreamAdderOrRemover();
    calculateCharactersInPanel();
    compileSchedule(scheduleEvents);
  }

  function handleStreamAdderOrRemover() {
    // this prevents having two stream elements on page at same time
    const bodyWidth = document.querySelector('body').clientWidth;
    if (bodyWidth >= 950) {
      if (mobile === true) {
        mobile = false;
        mobileStream.src = '';
        desktopStream.src = 'https://livestream.com/accounts/29263203/events/9057537/player?enableInfoAndActivity=false&defaultDrawer=&autoPlay=true&mute=false';
      }
    } else {
      if (mobile === false) {
        mobile = true;
        desktopStream.src = '';
        mobileStream.src = 'https://livestream.com/accounts/29263203/events/9057537/player?enableInfoAndActivity=false&defaultDrawer=&autoPlay=true&mute=false';
      }
    }
  }

  handleStreamAdderOrRemover();

  window.addEventListener("resize", _.debounce(debouncedResizeHandler, 150));

  function findCurrentAndNextShow(events) {
    let liveShow;
    const now = moment();
    for (let index = 0; index < events.length; index++) {
      const event = events[index];
      const eventStartMoment = moment(event.start.dateTime);
      const eventEndMoment = moment(event.end.dateTime);
      const isCurrent =
        eventStartMoment.isBefore(now) && eventEndMoment.isAfter(now);
      if (isCurrent) {
        liveShow = event;
        break;
      }
    }
    if (liveShow) {
      if (isLive !== true) {
        desktopStream.classList.remove("hidden");
        desktopPlaceholder.classList.add("hidden");
        mobileStream.classList.remove("hidden");
        mobilePlaceholder.classList.add("hidden");

        isLive = true;
      }
      if (currentShowName !== liveShow.summary.toUpperCase()) {
        currentShowName = liveShow.summary.toUpperCase();
        nowPlaying.innerHTML = `<div class="on-air">ON AIR:</div>&nbsp;<div class="now-playing-desktop">${currentShowName}</div>`;
        nowPlayingMobile.innerHTML = `<div class="on-air">ON AIR:</div><div>${currentShowName}</div>`;

        // check for tip jar
        if (liveShow.location) {
          desktopTipButton.classList.remove('hidden');
          mobileTipButton.classList.remove('hidden');
          desktopTipLink.href = liveShow.location;
          mobileTipLink.href = liveShow.location;
        } else {
          desktopTipButton.classList.add('hidden');
          mobileTipButton.classList.add('hidden');
        }
      }
    } else {
      if (isLive !== false) {
        desktopStream.classList.add("hidden");
        desktopPlaceholder.classList.remove("hidden");
        mobileStream.classList.add("hidden");
        mobilePlaceholder.classList.remove("hidden");
        isLive = false;
        nowPlaying.innerHTML = `<span>OFF AIR</span>`;
        nowPlayingMobile.innerHTML = `<span>OFF AIR</span>`;
        desktopTipButton.classList.add('hidden');
        mobileTipButton.classList.add('hidden');
      }
    }
  }

  function calculateCharactersInPanel() {
    // this uses element width to calculate # of characters needed to fill schedule
    const panelStyle = window.getComputedStyle(panelSpoofer, null);
    const panelPadding = Number(panelStyle.paddingLeft.replace("px", ""));
    const panelWidth =
      Number(panelStyle.getPropertyValue("width").replace("px", "")) -
      panelPadding * 2;

    const characterStyle = window.getComputedStyle(textSpoofer, null);
    const characterWidth = Number(
      characterStyle.getPropertyValue("width").replace("px", "")
    );
    charactersInPanel = Math.floor(panelWidth / characterWidth) - 2;
  }

  const nbsp = "&nbsp;";
  const formatWithDayOfWeek = "dddd M/DD";

  function compileSchedule(events) {
    const bodyWidth = document.querySelector('body').clientWidth;
    if (bodyWidth >= 950) {
      return compileDesktopSchedule(events);
    }
    return compileMobileSchedule(events);
  }

  function compileMobileSchedule(events) {
    const groupedByDate = _.groupBy(events, event => {
      return moment(event.start.dateTime).format("YYYY-MM-DD");
    });

    const initialFormatting = [];

    Object.keys(groupedByDate).forEach(date => {
      const dateDisplay = moment(date).format(formatWithDayOfWeek);
      initialFormatting.push(`${dateDisplay}<br>----<br>`)
      groupedByDate[date].forEach(event => {
        const formatted = `${moment(event.start.dateTime).format("h:mm A")} — ${
          event.summary
        }<br>`;
        initialFormatting.push(formatted);
      });
    });

    mobileSchedulePanel.innerHTML = initialFormatting.join('');
  }

  function compileDesktopSchedule(events) {
    let longestSummaryAndTime = 0;

    const groupedByDate = _.groupBy(events, event => {
      return moment(event.start.dateTime).format("YYYY-MM-DD");
    });

    const initialFormatting = [];

    Object.keys(groupedByDate).forEach(date => {
      const dateDisplay = moment(date).format(formatWithDayOfWeek);
      const shows = groupedByDate[date].map(event => {
        const formatted = `${moment(event.start.dateTime).format("h:mm A")} — ${
          event.summary
        }`;
        const formattedLength = formatted.length;
        if (formattedLength > longestSummaryAndTime) {
          longestSummaryAndTime = formattedLength;
        }
        return formatted;
      });

      initialFormatting.push({
        date: dateDisplay,
        shows: shows
      });
    });

    const charactersForFirstColumn = charactersInPanel - longestSummaryAndTime;
    let finalFormatting = "";

    initialFormatting.forEach((dateObj, i) => {
      const { date, shows } = dateObj;
      const firstShow = shows.shift();
      try {
        const numberOfDots = charactersForFirstColumn - date.length - 2;
        const firstShowString =
          date +
          " " +
          ".".repeat(numberOfDots) +
          " " +
          firstShow +
          "<br>";
        finalFormatting += firstShowString;
        shows.forEach(show => {
          finalFormatting += `${nbsp.repeat(
            charactersForFirstColumn
          )}${show}<br>`;
        });
      } catch (e) {
      }
    });
    schedulePanel.innerHTML = finalFormatting;
  }

  function triggerMarquee() {
    if (!marqueed) {
      maruqeed = true;
      const el = document.querySelector(".marquee");
      let speed = 4;
      let lastScrollPos = 0;
      let timer;
      const container = el.querySelector(".inner");
      const content = el.querySelector(".inner > *");
      //Get total width
      const elWidth = content.offsetWidth;

      //Duplicate content
      let clone = content.cloneNode(true);
      container.appendChild(clone);

      let progress = 1;
      function loop() {
        progress = progress - speed;
        if (progress <= elWidth * -1) {
          progress = 0;
        }
        container.style.transform = "translateX(" + progress + "px)";
        container.style.transform += "skewX(" + speed * 0.4 + "deg)";

        window.requestAnimationFrame(loop);
      }
      loop();
    }
  }
})();