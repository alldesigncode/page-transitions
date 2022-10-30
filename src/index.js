import { select, create, selectAll } from "./helpers";
import { gsap, Power1 } from "gsap";
import { DATA } from "./data";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

const keyCodes = {
  LEFT: 37,
  RIGHT: 39,
};

const PADDING = 30;
const ELEMENT_SIZE = 350;

window.addEventListener("load", () => {
  const main = select(".main");
  const details = select(".main > .detail");
  const mainImage = select(".main > .detail > img");

  let activeItem = null;
  let isAnimating = true;

  const generateList = function () {
    const mid = Math.floor(DATA.length / 2);
    let count = 0;
    DATA.forEach((d, index) => {
      const picture = create("div");
      const title = create("div");
      picture.classList.add("picture");
      title.classList.add("title");
      title.textContent = d.title;
      picture.appendChild(title);

      const img = create("img");
      img.src = d.imgUrl;

      gsap.to(picture, { zIndex: 100 });

      if (index === mid) {
        picture.classList.add("active");
        gsap.to(picture, { x: 0 });
      }

      if (index < mid) {
        gsap.to(picture, { x: -((ELEMENT_SIZE + PADDING) * (mid - index)) });
      }

      if (index > mid) {
        count++;
        gsap.to(picture, { x: (ELEMENT_SIZE + PADDING) * count });
      }

      picture.appendChild(img);
      main.appendChild(picture);
    });
  };

  generateList();

  const list = selectAll(".picture");
  list[list.length - 1].querySelector("img").addEventListener("load", () => {
    gsap
      .to(list, {
        autoAlpha: 1,
        delay: 0.5,
        duration: 0.4,
        ease: Power1.easeInOut,
      })
      .then(() => (isAnimating = false));
  });

  const animate = function (list, direction, clicked = null) {
    isAnimating = true;
    const selectedIndex = list.indexOf(clicked);
    const activeIndex = list.findIndex((el) => el.classList.contains("active"));
    let multiplyCount = 1;

    if (selectedIndex > -1 && activeIndex > -1) {
      if (activeIndex > selectedIndex) {
        multiplyCount = activeIndex - selectedIndex;
      } else {
        multiplyCount = selectedIndex - activeIndex;
      }
    }

    let len = list.length;
    let duration = 0;
    let next = null;

    list.forEach((pic, i) => {
      const propX = gsap.getProperty(pic, "x");
      const translateValueX = (ELEMENT_SIZE + PADDING) * multiplyCount || 1;

      if (activeIndex > -1) {
        next = list[direction === "left" ? activeIndex + 1 : activeIndex - 1];

        if (next == undefined || next == null) {
          isAnimating = false;
          return;
        }

        len = len - 1;

        duration = Math.max(
          duration,
          1 + (direction === "left" ? i * 0.08 : len * 0.08)
        );

        gsap.to(pic, {
          rotateY: `${1.2 * i}deg`,
          delay: direction === "left" ? i * 0.08 : len * 0.08,
          x:
            direction === "left"
              ? propX - translateValueX
              : propX + translateValueX,
          ease: "power2.inOut",
          duration: 1,
        });

        gsap.to(pic, {
          delay: 0.5 + (direction === "left" ? i * 0.08 : len * 0.08),
          ease: "power2.inOut",
          rotateY: "0",
          duration: 0.5,
        });
      }
    });

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (next == undefined || next == null) {
          reject();
          isAnimating = false;
          return;
        }

        if (clicked) {
          isAnimating = false;
          list[activeIndex].classList.remove("active");
          clicked.classList.add("active");
          resolve();
          return;
        }

        if (list[activeIndex]) {
          isAnimating = false;
          list[activeIndex].classList.remove("active");
          next.classList.add("active");
          resolve();
          return;
        }
      }, duration * 1000);
    });
  };

  const animateInOutItems = function (list, selectedIndex, dir = "out") {
    const animateLeft = (propX) => {
      return dir === "in"
        ? {
            delay: 0.5,
            duration: 2,
            ease: "power2.inOut",
            width: "350px",
            height: "350px",
            x: propX + 700,
          }
        : {
            delay: 0.5,
            duration: 2,
            ease: "power2.inOut",
            height: "700px",
            x: propX - 700,
          };
    };
    const animateRight = (propX) => {
      return dir === "in"
        ? {
            delay: 0.5,
            duration: 2,
            width: "350px",
            height: "350px",
            ease: "power2.inOut",
            x: propX - 700,
          }
        : {
            delay: 0.5,
            duration: 2,
            ease: "power2.inOut",
            height: "700px",
            x: propX + 700,
          };
    };

    list.forEach((item, i) => {
      const propX = gsap.getProperty(item, "x");

      if (i < selectedIndex) {
        gsap.to(item, { ...animateLeft(propX) });
      }

      if (i > selectedIndex) {
        gsap.to(item, { ...animateRight(propX) });
      }
    });
  };

  const showDetails = function (e) {
    if (!e.classList.contains("active")) {
      const propX = gsap.getProperty(e, "x");
      animate(selectAll(".picture"), propX < 0 ? "right" : "left", e).then(() =>
        showDetails(e)
      );
      return;
    }

    if (activeItem) {
      return hideDetails();
    }

    isAnimating = true;
    const onLoad = () => {
      gsap.set(e, { autoAlpha: 0 });
      const text = e.querySelector(".title").textContent;
      const list = selectAll(".picture");
      const index = list.indexOf(e);

      if (index > -1) {
        animateInOutItems(list, index, "out");
      }

      const detailsTitle = details.querySelector(".title");
      detailsTitle.textContent = text;

      Flip.fit(details, e);

      const state = Flip.getState(details);

      gsap.set(main, { clearProps: true });

      gsap.set(details, {
        visibility: "visible",
        overflow: "hidden",
        ease: "power2.inOut",
        position: "absolute",
        width: "350px",
        height: "350px",
        scrollTo: { y: 0, x: 0 },
      });

      Flip.from(state, {
        onComplete: () => gsap.set(details, { overflow: "auto" }),
      })
        .to(details, {
          duration: 2,
          zIndex: 1000,
          ease: "power2.inOut",
          height: "100%",
          width: "100%",
          transform: "none",
        })
        .then(() => (isAnimating = false));

      mainImage.removeEventListener("load", onLoad);
      document.addEventListener("click", () => !isAnimating && hideDetails());
    };

    mainImage.src = e.querySelector("img").src;
    mainImage.addEventListener("load", onLoad);

    activeItem = e;
  };

  const hideDetails = function () {
    isAnimating = true;
    document.removeEventListener("click", hideDetails);

    const state = Flip.getState(details);

    Flip.fit(details, activeItem);
    gsap.to(mainImage, {
      height: "100%",
      delay: 0.2,
      ease: "power2.inOut",
    });

    gsap.to(details, { delay: 0.2 });

    Flip.from(state, {
      duration: 2,
      ease: "power2.inOut",
      delay: 0.2,
      onComplete: () => (activeItem = null),
    })
      .set(details, {
        clearProps: true,
        width: 350,
        height: 350,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      })
      .then(() => (isAnimating = false));

    const temp = activeItem;
    const list = selectAll(".picture");
    const index = list.indexOf(temp);

    if (index > -1) {
      gsap.set(temp, { delay: 2.2, autoAlpha: 1 });
      animateInOutItems(list, index, "in");
    }
  };

  selectAll(".picture").forEach((a) =>
    a.addEventListener("click", () => !isAnimating && showDetails(a))
  );

  window.addEventListener("wheel", (e) => {
    const list = selectAll(".picture");

    if (e.deltaX < 0 && !isAnimating) {
      animate(list, "right");
    }

    if (e.deltaX > 0 && !isAnimating) {
      animate(list, "left");
    }
  });

  window.addEventListener("keydown", ({ keyCode }) => {
    const { LEFT, RIGHT } = keyCodes;
    const list = selectAll(".picture");

    if (keyCode === LEFT && !isAnimating) {
      animate(list, "left", null);
    }

    if (keyCode === RIGHT && !isAnimating) {
      animate(list, "right", null);
    }
  });
});
