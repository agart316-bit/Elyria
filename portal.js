(function () {
  "use strict";

  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function formatTime(date) {
    return pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
  }

  function formatDate(date) {
    return days[date.getDay()] + " \u00b7 " + date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
  }

  function parseLocalDate(isoDate) {
    var parts = isoDate.split("-");
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function formatIsoDate(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function formatGreeting(date) {
    var hour = date.getHours();

    if (hour < 5) {
      return "Good night,<br />Elyria.";
    }

    if (hour < 12) {
      return "Good morning,<br />Elyria.";
    }

    if (hour < 18) {
      return "Good afternoon,<br />Elyria.";
    }

    return "Good evening,<br />Elyria.";
  }

  function tick() {
    var now = new Date();
    var headerClock = document.getElementById("header-clock");
    var headerDate = document.getElementById("header-date");
    var tickerClock = document.getElementById("ticker-clock");
    var heroGreeting = document.getElementById("hero-greeting");

    if (headerClock) {
      headerClock.textContent = formatTime(now);
      headerClock.setAttribute("datetime", now.toISOString());
    }

    if (headerDate) {
      headerDate.textContent = formatDate(now);
    }

    if (tickerClock) {
      tickerClock.textContent = formatTime(now);
    }

    if (heroGreeting) {
      heroGreeting.innerHTML = formatGreeting(now);
    }
  }

  tick();
  setInterval(tick, 1000);

  // Hero slideshow — three panels that dissolve between image sets every 3 seconds
  var panels = document.querySelectorAll(".hero-fullbleed__panel");
  var current = 0;
  var total = 0;

  if (panels.length) {
    total = panels[0].querySelectorAll(".hero-fullbleed__slide").length;
  }

  if (panels.length && total >= 2) {
    function goTo(index) {
      current = (index + total) % total;

      Array.prototype.forEach.call(panels, function (panel) {
        var panelSlides = panel.querySelectorAll(".hero-fullbleed__slide");

        Array.prototype.forEach.call(panelSlides, function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
      });
    }

    goTo(0);

    setInterval(function () {
      goTo(current + 1);
    }, 3000);
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-carousel]"), function (carousel) {
    var viewport = carousel.querySelector(".calendar-carousel__viewport");
    var cards = carousel.querySelectorAll("[data-carousel-card]");
    var prevButton = carousel.querySelector('[data-carousel-action="prev"]');
    var nextButton = carousel.querySelector('[data-carousel-action="next"]');
    var activeIndex = 0;
    var wheelLock = false;
    var totalCards = cards.length;

    if (!viewport || totalCards < 2) {
      return;
    }

    function assignState(card, offset) {
      var state = "";
      card.classList.remove(
        "is-active",
        "is-prev",
        "is-next",
        "is-far-prev",
        "is-far-next",
        "is-hidden-prev",
        "is-hidden-next"
      );

      if (offset === 0) {
        state = "is-active";
      } else if (offset === -1) {
        state = "is-prev";
      } else if (offset === 1) {
        state = "is-next";
      } else if (offset === -2) {
        state = "is-far-prev";
      } else if (offset === 2) {
        state = "is-far-next";
      } else if (offset < 0) {
        state = "is-hidden-prev";
      } else {
        state = "is-hidden-next";
      }

      card.classList.add(state);
      card.setAttribute("aria-hidden", offset === 0 ? "false" : "true");
    }

    function updateCarousel(index) {
      activeIndex = (index + totalCards) % totalCards;

      Array.prototype.forEach.call(cards, function (card, cardIndex) {
        var forward = (cardIndex - activeIndex + totalCards) % totalCards;
        var backward = (activeIndex - cardIndex + totalCards) % totalCards;
        var offset = forward <= backward ? forward : -backward;

        assignState(card, offset);
      });
    }

    function moveCarousel(step) {
      updateCarousel(activeIndex + step);
    }

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        moveCarousel(-1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        moveCarousel(1);
      });
    }

    viewport.addEventListener("wheel", function (event) {
      var delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;

      if (wheelLock || Math.abs(delta) < 12) {
        return;
      }

      event.preventDefault();
      wheelLock = true;
      moveCarousel(delta > 0 ? 1 : -1);

      setTimeout(function () {
        wheelLock = false;
      }, 420);
    }, { passive: false });

    viewport.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveCarousel(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveCarousel(1);
      }
    });

    updateCarousel(0);
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-community-pagination]"), function (root) {
    var cards = root.querySelectorAll("[data-community-card]");
    var buttons = root.querySelectorAll("[data-community-page-button]");
    var activeIndex = 0;

    if (!cards.length || cards.length !== buttons.length) {
      return;
    }

    function setCommunityPage(index) {
      activeIndex = (index + cards.length) % cards.length;

      Array.prototype.forEach.call(cards, function (card, cardIndex) {
        var isActive = cardIndex === activeIndex;
        card.classList.toggle("is-active", isActive);
        card.hidden = !isActive;
      });

      Array.prototype.forEach.call(buttons, function (button, buttonIndex) {
        var isActive = buttonIndex === activeIndex;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", isActive ? "true" : "false");
        button.setAttribute("tabindex", isActive ? "0" : "-1");
      });
    }

    root.addEventListener("click", function (event) {
      var button = event.target.closest("[data-community-page-button]");

      if (!button) {
        return;
      }

      setCommunityPage(Array.prototype.indexOf.call(buttons, button));
    });

    root.addEventListener("keydown", function (event) {
      var currentButton = event.target.closest("[data-community-page-button]");
      var nextIndex = activeIndex;

      if (!currentButton) {
        return;
      }

      if (event.key === "ArrowRight") {
        nextIndex = activeIndex + 1;
      } else if (event.key === "ArrowLeft") {
        nextIndex = activeIndex - 1;
      } else {
        return;
      }

      event.preventDefault();
      setCommunityPage(nextIndex);
      buttons[activeIndex].focus();
    });

    setCommunityPage(0);
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-year-calendar]"), function (root) {
    var weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var annualEvents = [
      { id: "2026-01-03-morning-walk-d5", date: "2026-01-03", title: "Northern Slope Morning Walk", chip: "Morning Walk", time: "Saturday · 08:00", location: "District Five · Terraced Gardens", description: "Early-morning walk through the terraced gardens. Open to all." },
      { id: "2026-01-09-evening-music", date: "2026-01-09", title: "Evening Music — Winter Strings", chip: "Evening Music", time: "Friday · 19:30", location: "Civic Heart · Open Air Stage", description: "Winter chamber set. Arrive any time, stay as long as you like." },
      { id: "2026-01-14-open-session-jan", date: "2026-01-14", title: "Learning Commons Open Session", chip: "Open Session", time: "Wednesday · 14:00", location: "District One · Learning Commons", description: "Research rooms open to all residents. Scholars available for questions." },
      { id: "2026-01-18-seed-exchange", date: "2026-01-18", title: "Glasshouse Seed Exchange", chip: "Seed Exchange", time: "Sunday · 11:00", location: "District Six · Glass Hall", description: "Residents trade saved seeds, cuttings, and planting notes with district stewards on hand." },
      { id: "2026-01-24-founders-reading", date: "2026-01-24", title: "Foundational Reading", chip: "Readings", time: "Saturday · 16:00", location: "Civic Heart · Great Commons", description: "Civic founding texts read aloud by rotating resident voices." },
      { id: "2026-01-30-shared-table-d2", date: "2026-01-30", title: "Shared Table — Eastern Reach", chip: "Shared Table", time: "Friday · 18:00", location: "District Two · Market Hall", description: "Resident-organised communal meal. Open to whoever shows up." },
      { id: "2026-02-06-greenhouse-recital", date: "2026-02-06", title: "Greenhouse Recital", chip: "Greenhouse Recital", time: "Friday · 18:30", location: "District Six · Glass Hall", description: "Low-light recital among botanical corridors. No seating plan — find a spot." },
      { id: "2026-02-11-care-info", date: "2026-02-11", title: "Care Network Information Session", chip: "Care Info", time: "Wednesday · 15:00", location: "District One · Health Commons", description: "Covers care center locations, services, and how to access support. Informal and open." },
      { id: "2026-02-14-winter-shared-table", date: "2026-02-14", title: "Winter Shared Table", chip: "Shared Table", time: "Saturday · 17:30", location: "District Four · Garden Commons", description: "A slower winter communal meal with warm broths, bread, and open seats throughout the evening." },
      { id: "2026-02-21-community-cultivation-day", date: "2026-02-21", title: "Community Cultivation Day", chip: "Cultivation Day", time: "Saturday · Morning", location: "Districts Four and Six", description: "Soil care, pruning, and shared midday food with district stewards." },
      { id: "2026-02-27-evening-music-feb", date: "2026-02-27", title: "Evening Music — Wind Quartet", chip: "Evening Music", time: "Friday · 19:00", location: "Civic Heart · Assembly Hall", description: "Indoor winter performance. Open entry." },
      { id: "2026-03-07-river-walk", date: "2026-03-07", title: "River Corridor Walk", chip: "River Walk", time: "Saturday · 10:00", location: "District Three · River Quarter", description: "Guided walk along the river with a steward. About 90 minutes." },
      { id: "2026-03-11-learning-commons-open-session", date: "2026-03-11", title: "Learning Commons Open Session", chip: "Open Session", time: "Wednesday · 14:00", location: "District One · Learning Commons", description: "Research rooms open to the public. Scholars available for questions." },
      { id: "2026-03-15-care-garden-open-hours", date: "2026-03-15", title: "Care Garden Open Hours", chip: "Open Hours", time: "Sunday · 13:00", location: "District Four · Restorative Gardens", description: "Quiet open hours in the care gardens with herbal tea service and resident guides." },
      { id: "2026-03-20-spring-shared-table", date: "2026-03-20", title: "Spring Shared Table", chip: "Shared Table", time: "Friday · 18:30", location: "District Five · Outer Commons", description: "First outdoor shared table of the season. Bring something if you can; nothing required if you can't." },
      { id: "2026-03-28-river-lantern-walk", date: "2026-03-28", title: "River Lantern Walk", chip: "Lantern Walk", time: "Saturday · Dusk", location: "District Three · River Quarter", description: "Evening walk with hand-lanterns and quiet music. No sign-up needed." },
      { id: "2026-04-04-d4-assembly-open", date: "2026-04-04", title: "District Four Open Assembly", chip: "Assembly", time: "Saturday · 14:00", location: "District Four · Western Gardens Care House", description: "Open assembly. All residents welcome. Agenda posted on the district board one week prior." },
      { id: "2026-04-10-evening-music-string-ensemble", date: "2026-04-10", title: "Evening Music — String Ensemble", chip: "Evening Music", time: "Friday · After sunset", location: "Civic Heart · Open Air Stage", description: "Open-air chamber performance. Arrive whenever, stand or sit." },
      { id: "2026-04-17-harvest-table-preparations", date: "2026-04-17", title: "Harvest Table Prep Day", chip: "Prep Hours", time: "Friday · All day", location: "District Three · Community Kitchen", description: "Open prep hours. Show up and ask where you're needed." },
      { id: "2026-04-19-district-six-garden-walk", date: "2026-04-19", title: "District Six Garden Walk", chip: "Garden Walk", time: "Sunday · Midday", location: "District Six · Greenway Route", description: "Guided route through the greenway corridor. Some sections seasonally rerouted." },
      { id: "2026-04-22-evening-commons-rehearsal", date: "2026-04-22", title: "Evening Commons Rehearsal", chip: "Rehearsal", time: "Wednesday · 18:30", location: "Civic Heart · Assembly Hall", description: "An open rehearsal for the week's music gathering. Walk in quietly or stay for the full set." },
      { id: "2026-04-25-contribution-open-day", date: "2026-04-25", title: "Office of Contribution — Open Day", chip: "Contribution", time: "Saturday · 10:00–16:00", location: "All district civic buildings", description: "Drop in to talk with contribution coordinators. No appointment needed." },
      { id: "2026-04-30-river-lantern-making", date: "2026-04-30", title: "River Lantern Making", chip: "Workshop", time: "Thursday · 17:00", location: "District Three · River Pavilion", description: "Residents make lanterns for early-summer river walks using salvaged paper and reed frames." },
      { id: "2026-05-02-founders-reading-may", date: "2026-05-02", title: "Foundational Reading", chip: "Readings", time: "Saturday · 17:00", location: "Civic Heart · Great Commons", description: "Civic texts read aloud by community voices and district delegates." },
      { id: "2026-05-09-evening-music-may", date: "2026-05-09", title: "Evening Music — Open Air", chip: "Evening Music", time: "Friday · After sunset", location: "Civic Heart · Open Air Stage", description: "Spring open-air session. Multiple performers, no fixed programme." },
      { id: "2026-05-14-terrace-choir", date: "2026-05-14", title: "High District Terrace Choir", chip: "Choir", time: "Thursday · 19:00", location: "District Seven · Upper Terraces", description: "Open chorus practice with long views over the city and no audition required." },
      { id: "2026-05-16-community-cultivation-day-may", date: "2026-05-16", title: "Community Cultivation Day", chip: "Cultivation Day", time: "Saturday · Morning", location: "District Five · Terraced Gardens", description: "Seasonal planting and maintenance. All skill levels welcome." },
      { id: "2026-05-23-shared-table-d3", date: "2026-05-23", title: "Shared Table — River Quarter", chip: "Shared Table", time: "Saturday · 18:00", location: "District Three · Riverside", description: "Outdoor communal meal by the river. Bring a dish or just come." },
      { id: "2026-05-30-housing-info", date: "2026-05-30", title: "Housing Systems Information Session", chip: "Housing Info", time: "Saturday · 11:00", location: "District Two · Civic Building", description: "Covers home adaptation, expansion requests, and contraction options. Open to all residents." },
      { id: "2026-06-05-solstice-choir", date: "2026-06-05", title: "Solstice Choir — Open Rehearsal", chip: "Solstice Choir", time: "Friday · 19:00", location: "Civic Heart · Assembly Hall", description: "Open rehearsal for the midsummer civic choir. Listeners and participants both welcome." },
      { id: "2026-06-11-kitchen-open-service", date: "2026-06-11", title: "Community Kitchen Open Service", chip: "Kitchen Tour", time: "Thursday · 16:00", location: "District Three · Community Kitchen", description: "A guided look at daily provisioning, storage, and service rhythms inside the kitchen." },
      { id: "2026-06-13-d7-terrace-evening", date: "2026-06-13", title: "High District Terrace Evening", chip: "Terrace Evening", time: "Saturday · Dusk", location: "District Seven · Upper Terraces", description: "Informal evening on the upper terraces. Views over the whole city. No programme." },
      { id: "2026-06-20-solstice-commons-night", date: "2026-06-20", title: "Solstice Commons Night", chip: "Solstice Night", time: "Saturday · Dusk", location: "Civic Heart · Great Commons", description: "Music, light, and shared tables for the longest evening of the year." },
      { id: "2026-06-27-open-session-june", date: "2026-06-27", title: "Learning Commons Open Session", chip: "Open Session", time: "Saturday · 13:00", location: "District One · Learning Commons", description: "Summer session. Archives and research rooms open. No topic restrictions." },
      { id: "2026-07-04-evening-music-july", date: "2026-07-04", title: "Evening Music — Summer Set", chip: "Evening Music", time: "Saturday · After sunset", location: "Civic Heart · Open Air Stage", description: "Summer open-air music. No set end time." },
      { id: "2026-07-08-open-air-lecture", date: "2026-07-08", title: "Open Air Lecture", chip: "Lecture", time: "Wednesday · 18:00", location: "District One · Outer Court", description: "Public talk followed by open discussion. Topic posted on the District One board one week prior." },
      { id: "2026-07-12-midyear-forum", date: "2026-07-12", title: "Midyear Assembly Forum", chip: "Forum", time: "Sunday · 15:00", location: "Civic Heart · Great Commons", description: "Cross-district forum reviewing the year's public works and upcoming seasonal priorities." },
      { id: "2026-07-18-d6-garden-walk-summer", date: "2026-07-18", title: "District Six Garden Walk", chip: "Garden Walk", time: "Saturday · 09:00", location: "District Six · Greenway Route", description: "Early summer walk through the full greenway corridor. About two hours." },
      { id: "2026-07-25-river-quarter-night-table", date: "2026-07-25", title: "River Quarter Night Table", chip: "Shared Table", time: "Saturday · Evening", location: "District Three · River Quarter", description: "Extended communal meal into the night. Low music, lanterns, open door." },
      { id: "2026-07-31-river-cooling-night", date: "2026-07-31", title: "River Cooling Night", chip: "Evening Walk", time: "Friday · After sunset", location: "District Three · Riverside", description: "A late-summer evening walk and cool drinks service along the river path." },
      { id: "2026-08-01-cultivation-day-aug", date: "2026-08-01", title: "Community Cultivation Day", chip: "Cultivation Day", time: "Saturday · Morning", location: "District Three · River Plots", description: "Late-summer harvest coordination and soil maintenance along the river plots." },
      { id: "2026-08-08-shared-table-d1", date: "2026-08-08", title: "Shared Table — Learning Quarter", chip: "Shared Table", time: "Saturday · 18:00", location: "District One · Outer Court", description: "Summer shared table in the outdoor space of the Learning Quarter." },
      { id: "2026-08-14-palm-court-dance", date: "2026-08-14", title: "Palm Court Dance", chip: "Palm Court Dance", time: "Friday · 20:00", location: "District Seven · Palm Court", description: "Open dance evening in one of Elyria's most luminous ceremonial rooms." },
      { id: "2026-08-19-night-reading", date: "2026-08-19", title: "Learning Quarter Night Reading", chip: "Night Reading", time: "Wednesday · 20:00", location: "District One · Reading Court", description: "Residents read long-form texts aloud after dark beneath the open clerestory lights." },
      { id: "2026-08-22-evening-music-aug", date: "2026-08-22", title: "Evening Music — Late Summer", chip: "Evening Music", time: "Saturday · After sunset", location: "Civic Heart · Open Air Stage", description: "End-of-summer outdoor music. No set end time." },
      { id: "2026-08-29-open-session-august", date: "2026-08-29", title: "Learning Commons Open Session", chip: "Open Session", time: "Saturday · Afternoon", location: "District One · Learning Commons", description: "Late-summer session: archives, model rooms, and open discussion." },
      { id: "2026-09-05-d5-assembly-open", date: "2026-09-05", title: "District Five Open Assembly", chip: "Assembly", time: "Saturday · 14:00", location: "District Five · Northern Slope Commons", description: "Open assembly. All residents welcome. One of the city's largest district gatherings." },
      { id: "2026-09-09-harvest-lantern-workshop", date: "2026-09-09", title: "Harvest Lantern Workshop", chip: "Workshop", time: "Wednesday · 17:30", location: "District Three · Community Kitchen", description: "Lantern-making and table dressing ahead of harvest week, open to children and adults alike." },
      { id: "2026-09-12-autumn-harvest-table", date: "2026-09-12", title: "Autumn Harvest Table", chip: "Harvest Table", time: "Saturday · All day", location: "District Three · Community Kitchen", description: "Extended public meal across the River Quarter. Morning prep, afternoon and evening service." },
      { id: "2026-09-18-harvest-table-closing-music", date: "2026-09-18", title: "Harvest Week Closing Music", chip: "Closing Music", time: "Friday · Evening", location: "District Three · River Quarter", description: "Music and open circulation to close out the harvest week. No formal programme." },
      { id: "2026-09-24-open-dance", date: "2026-09-24", title: "Civic Heart Open Dance", chip: "Open Dance", time: "Thursday · 20:00", location: "Civic Heart · Great Commons", description: "A citywide dance night with live musicians and no dress code or assigned partners." },
      { id: "2026-09-26-evening-music-sept", date: "2026-09-26", title: "Evening Music — Autumn Opening", chip: "Evening Music", time: "Saturday · After sunset", location: "Civic Heart · Open Air Stage", description: "First autumn outdoor music session. Dress for the cooler air." },
      { id: "2026-10-03-foundational-readings-oct", date: "2026-10-03", title: "Foundational Reading", chip: "Readings", time: "Saturday · 16:30", location: "Civic Heart · Great Commons", description: "Civic texts read in a rotating sequence of resident voices." },
      { id: "2026-10-10-d6-autumn-walk", date: "2026-10-10", title: "District Six Autumn Walk", chip: "Garden Walk", time: "Saturday · 10:00", location: "District Six · Greenway Route", description: "Autumn walk with ecology stewards. Peak foliage expected this week." },
      { id: "2026-10-14-listening-circle", date: "2026-10-14", title: "Western Gardens Listening Circle", chip: "Listening Circle", time: "Wednesday · 18:00", location: "District Four · Garden Rooms", description: "A quiet evening circle for reflection, seasonal updates, and community requests." },
      { id: "2026-10-17-community-cultivation-day-oct", date: "2026-10-17", title: "Community Cultivation Day", chip: "Cultivation Day", time: "Saturday · Morning", location: "District Six · Greenway Route", description: "Autumn maintenance and seed collection. Stewards on site from 08:00." },
      { id: "2026-10-24-shared-table-d4", date: "2026-10-24", title: "Shared Table — Western Gardens", chip: "Shared Table", time: "Saturday · 17:30", location: "District Four · Garden Commons", description: "Autumn communal meal in the Western Gardens. Quieter pace, smaller gathering." },
      { id: "2026-10-31-evening-music-oct", date: "2026-10-31", title: "Evening Music — Autumn Night", chip: "Evening Music", time: "Saturday · After sunset", location: "Civic Heart · Assembly Hall", description: "Indoor autumn set. Fires lit. Open entry." },
      { id: "2026-11-06-evening-music-brass", date: "2026-11-06", title: "Evening Music — Brass Night", chip: "Evening Music", time: "Friday · After sunset", location: "Civic Heart · Open Air Stage", description: "Cold-season outdoor performance. Fires around the commons. Dress warmly." },
      { id: "2026-11-12-night-care-session", date: "2026-11-12", title: "Care Network Night Session", chip: "Care Session", time: "Thursday · 18:00", location: "Civic Heart Care Center", description: "Open evening session on winter readiness, overnight care, and neighborhood support routes." },
      { id: "2026-11-14-open-session-nov", date: "2026-11-14", title: "Learning Commons Open Session", chip: "Open Session", time: "Saturday · 13:00", location: "District One · Learning Commons", description: "Autumn session. Archives and discussion rooms open." },
      { id: "2026-11-21-lantern-assembly", date: "2026-11-21", title: "Lantern Assembly", chip: "Lantern Assembly", time: "Saturday · Evening", location: "District Two · Eastern Reach", description: "Lantern makers, musicians, and market vendors in the Eastern Reach." },
      { id: "2026-11-28-shared-table-d3-winter", date: "2026-11-28", title: "Shared Table — River Quarter", chip: "Shared Table", time: "Saturday · 17:00", location: "District Three · Community Kitchen", description: "Indoor winter shared table. One of the warmer spots in the city on a cold evening." },
      { id: "2026-12-04-winter-strings", date: "2026-12-04", title: "Evening Music — Winter Strings", chip: "Evening Music", time: "Friday · Evening", location: "District Seven · Upper Hall", description: "Quieter seasonal concert in the High District. Limited capacity — arrive early." },
      { id: "2026-12-09-kitchen-chorus", date: "2026-12-09", title: "Winter Kitchen Chorus", chip: "Chorus", time: "Wednesday · 19:00", location: "District Three · Community Kitchen", description: "A warm indoor singing night between evening meal services. Residents drift in and out freely." },
      { id: "2026-12-12-cultivation-day-dec", date: "2026-12-12", title: "Community Cultivation Day", chip: "Cultivation Day", time: "Saturday · Morning", location: "Districts Four and Five", description: "Winter preparation and covered-bed maintenance. Wraps up by midday." },
      { id: "2026-12-19-long-night-table", date: "2026-12-19", title: "Long Night Table", chip: "Shared Table", time: "Saturday · Late evening", location: "District Three · Community Kitchen", description: "Winter communal table running deep into the night. Warm food throughout." },
      { id: "2026-12-26-evening-music-dec", date: "2026-12-26", title: "Evening Music — Year's End", chip: "Evening Music", time: "Saturday · 19:00", location: "Civic Heart · Assembly Hall", description: "Last music gathering of the year. Indoor, open entry, no fixed programme." }
    ];
    var calendarImages = [
      "images/cosmos_39794363.jpeg",
      "images/cosmos_165848302.jpeg",
      "images/cosmos_1465930691.jpeg",
      "images/cosmos_1954271316.jpeg",
      "images/cosmos_1774952956.jpeg",
      "images/cosmos_2034656126.jpeg",
      "images/cosmos_1307433202.jpeg",
      "images/cosmos_1927350938.jpeg",
      "images/cosmos_1506459162.jpeg",
      "images/cosmos_510184085.jpeg",
      "images/cosmos_581164813.jpeg",
      "images/cosmos_1764152140.jpeg"
    ];
    var calendarYear = Number(root.getAttribute("data-calendar-year")) || 2026;
    var todayIso = root.getAttribute("data-calendar-today") || formatIsoDate(new Date());
    var todayDate = parseLocalDate(todayIso);
    var eventsByDate = {};
    var eventsById = {};
    var activeChip = null;
    var activeMonthIndex = todayDate.getFullYear() === calendarYear ? todayDate.getMonth() : 0;
    var calendarBand = root.closest(".events-calendar-band");
    var calendarImage = calendarBand ? calendarBand.querySelector("[data-calendar-image]") : null;
    var prevButton = document.createElement("button");
    var nextButton = document.createElement("button");
    var pagination = document.createElement("div");
    var stage = document.createElement("div");
    var monthButtons = [];
    var popover = document.createElement("div");

    annualEvents.forEach(function (eventData) {
      if (Number(eventData.date.slice(0, 4)) !== calendarYear) {
        return;
      }

      if (!eventsByDate[eventData.date]) {
        eventsByDate[eventData.date] = [];
      }

      eventsByDate[eventData.date].push(eventData);
      eventsById[eventData.id] = eventData;
    });

    prevButton.type = "button";
    prevButton.className = "year-calendar__nav";
    prevButton.textContent = "←";
    prevButton.setAttribute("aria-label", "Show previous calendar month");
    prevButton.setAttribute("data-calendar-nav", "prev");
    nextButton.type = "button";
    nextButton.className = "year-calendar__nav";
    nextButton.textContent = "→";
    nextButton.setAttribute("aria-label", "Show next calendar month");
    nextButton.setAttribute("data-calendar-nav", "next");
    pagination.className = "year-calendar__pagination";
    stage.className = "year-calendar__stage";
    stage.setAttribute("aria-live", "polite");

    pagination.appendChild(prevButton);

    months.forEach(function (monthName, monthIndex) {
      var monthButton = document.createElement("button");
      monthButton.type = "button";
      monthButton.className = "year-calendar__page";
      monthButton.textContent = monthName.slice(0, 3);
      monthButton.setAttribute("data-calendar-month", String(monthIndex));
      pagination.appendChild(monthButton);
      monthButtons.push(monthButton);
    });

    pagination.appendChild(nextButton);

    popover.className = "event-popover";
    popover.hidden = true;
    popover.setAttribute("aria-live", "polite");

    root.appendChild(pagination);
    root.appendChild(stage);
    root.appendChild(popover);

    function closePopover() {
      if (activeChip) {
        activeChip.classList.remove("is-active");
        activeChip.setAttribute("aria-expanded", "false");
      }

      activeChip = null;
      popover.hidden = true;
      popover.innerHTML = "";
      popover.classList.remove("is-past");
      popover.style.left = "";
      popover.style.top = "";
    }

    function updateCalendarImageStart() {
      if (!calendarBand) {
        return;
      }

      var bandRect = calendarBand.getBoundingClientRect();
      var stageRect = stage.getBoundingClientRect();
      var stageTop = Math.max(0, stageRect.top - bandRect.top);

      calendarBand.style.setProperty("--calendar-image-start", stageTop + "px");
    }

    function positionPopover(trigger) {
      var rootRect = root.getBoundingClientRect();
      var triggerRect = trigger.getBoundingClientRect();
      var left = triggerRect.right - rootRect.left + 12;
      var top = triggerRect.top - rootRect.top - 8;
      var maxLeft = root.clientWidth - popover.offsetWidth - 8;
      var maxTop = root.scrollHeight - popover.offsetHeight - 8;

      if (left > maxLeft) {
        left = triggerRect.left - rootRect.left - popover.offsetWidth - 12;
      }

      if (left < 8) {
        left = Math.max(8, Math.min(root.clientWidth - popover.offsetWidth - 8, triggerRect.left - rootRect.left));
      }

      if (top > maxTop) {
        top = maxTop;
      }

      if (top < 8) {
        top = 8;
      }

      popover.style.left = left + "px";
      popover.style.top = top + "px";
    }

    function openPopover(trigger, eventData) {
      var isPastEvent = eventData.date < todayIso;

      if (activeChip && activeChip !== trigger) {
        activeChip.classList.remove("is-active");
        activeChip.setAttribute("aria-expanded", "false");
      }

      activeChip = trigger;
      activeChip.classList.add("is-active");
      activeChip.setAttribute("aria-expanded", "true");

      popover.classList.toggle("is-past", isPastEvent);
      popover.innerHTML =
        '<button type="button" class="event-popover__close" aria-label="Close event details">×</button>' +
        '<p class="event-popover__eyebrow">' + months[parseLocalDate(eventData.date).getMonth()] + " " + parseLocalDate(eventData.date).getDate() + ", " + calendarYear + "</p>" +
        '<h3 class="event-popover__title">' + eventData.title + "</h3>" +
        '<p class="event-popover__meta">' + eventData.time + "<br>" + eventData.location + "</p>" +
        '<p class="event-popover__copy">' + eventData.description + "</p>";
      popover.hidden = false;
      requestAnimationFrame(function () {
        positionPopover(trigger);
      });
    }

    function buildMonth(monthIndex) {
      var monthCard = document.createElement("article");
      var monthHeader = document.createElement("div");
      var monthTitle = document.createElement("h3");
      var monthYear = document.createElement("span");
      var weekdays = document.createElement("div");
      var daysGrid = document.createElement("div");
      var firstDay = new Date(calendarYear, monthIndex, 1);
      var daysInMonth = new Date(calendarYear, monthIndex + 1, 0).getDate();
      var startOffset = firstDay.getDay();
      var dayNumber;

      monthCard.className = "event-month";
      monthHeader.className = "event-month__header";
      monthTitle.className = "event-month__title";
      monthYear.className = "event-month__year";
      weekdays.className = "event-month__weekdays";
      daysGrid.className = "event-month__days";

      monthTitle.textContent = months[monthIndex];
      monthYear.textContent = String(calendarYear);

      weekdayLabels.forEach(function (label) {
        var weekday = document.createElement("div");
        weekday.className = "event-month__weekday";
        weekday.textContent = label;
        weekdays.appendChild(weekday);
      });

      for (dayNumber = 0; dayNumber < startOffset; dayNumber += 1) {
        var blank = document.createElement("div");
        blank.className = "event-month__blank";
        blank.setAttribute("aria-hidden", "true");
        daysGrid.appendChild(blank);
      }

      for (dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
        var currentDate = new Date(calendarYear, monthIndex, dayNumber);
        var isoDate = formatIsoDate(currentDate);
        var monthDay = document.createElement("div");
        var dayNumberLabel = document.createElement("div");
        var chipList = document.createElement("div");
        var dayEvents = eventsByDate[isoDate] || [];

        monthDay.className = "event-month__day";
        dayNumberLabel.className = "event-month__day-number";
        chipList.className = "event-chip-list";

        if (dayEvents.length) {
          monthDay.classList.add("event-month__day--has-events");
        }

        if (isoDate === todayIso) {
          monthDay.classList.add("event-month__day--today");
        }

        dayNumberLabel.textContent = String(dayNumber);
        monthDay.appendChild(dayNumberLabel);

        dayEvents.forEach(function (eventData) {
          var chip = document.createElement("button");
          chip.type = "button";
          chip.className = "event-chip";
          chip.textContent = eventData.chip;
          chip.setAttribute("data-event-id", eventData.id);
          chip.setAttribute("aria-expanded", "false");

          if (eventData.date < todayIso) {
            chip.classList.add("is-past");
          }

          chipList.appendChild(chip);
        });

        if (dayEvents.length) {
          monthDay.appendChild(chipList);
        }

        daysGrid.appendChild(monthDay);
      }

      monthHeader.appendChild(monthTitle);
      monthHeader.appendChild(monthYear);
      monthCard.appendChild(monthHeader);
      monthCard.appendChild(weekdays);
      monthCard.appendChild(daysGrid);

      return monthCard;
    }

    function renderMonth(monthIndex) {
      activeMonthIndex = (monthIndex + 12) % 12;

      if (calendarImage) {
        calendarImage.src = calendarImages[activeMonthIndex];
      }

      stage.innerHTML = "";
      stage.appendChild(buildMonth(activeMonthIndex));
      closePopover();
      requestAnimationFrame(updateCalendarImageStart);

      monthButtons.forEach(function (button, buttonIndex) {
        var isActive = buttonIndex === activeMonthIndex;
        button.classList.toggle("is-active", isActive);

        if (isActive) {
          button.setAttribute("aria-current", "page");
        } else {
          button.removeAttribute("aria-current");
        }
      });
    }

    renderMonth(activeMonthIndex);
    requestAnimationFrame(updateCalendarImageStart);

    root.addEventListener("click", function (event) {
      var closeButton = event.target.closest(".event-popover__close");
      var navButton = event.target.closest("[data-calendar-nav]");
      var monthButton = event.target.closest("[data-calendar-month]");
      var chip = event.target.closest(".event-chip");

      if (closeButton) {
        closePopover();
        return;
      }

      if (navButton) {
        renderMonth(activeMonthIndex + (navButton.getAttribute("data-calendar-nav") === "next" ? 1 : -1));
        return;
      }

      if (monthButton) {
        renderMonth(Number(monthButton.getAttribute("data-calendar-month")));
        return;
      }

      if (chip) {
        var eventData = eventsById[chip.getAttribute("data-event-id")];

        if (!eventData) {
          return;
        }

        if (activeChip === chip && !popover.hidden) {
          closePopover();
          return;
        }

        openPopover(chip, eventData);
        return;
      }

      if (activeChip && !event.target.closest(".event-popover")) {
        closePopover();
      }
    });

    document.addEventListener("click", function (event) {
      if (!activeChip || root.contains(event.target)) {
        return;
      }

      closePopover();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && activeChip) {
        closePopover();
        return;
      }

      if (event.key === "ArrowLeft" && root.contains(document.activeElement)) {
        renderMonth(activeMonthIndex - 1);
        return;
      }

      if (event.key === "ArrowRight" && root.contains(document.activeElement)) {
        renderMonth(activeMonthIndex + 1);
      }
    });

    window.addEventListener("resize", function () {
      updateCalendarImageStart();

      if (activeChip && !popover.hidden) {
        positionPopover(activeChip);
      }
    });
  });
})();
