import { useEffect } from "react";

export default function ScrollController() {
  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.fromTo(
            el,
            { y: 36, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-scrub-fade]").forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0.18, scale: 0.94 },
            {
              opacity: 1,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top 80%",
                end: "top 30%",
                scrub: true,
              },
            },
          );
        });

        const pinSection = document.querySelector<HTMLElement>(
          "[data-pin-section]",
        );
        const pinTitle = document.querySelector<HTMLElement>("[data-pin-title]");
        if (pinSection && pinTitle && window.matchMedia("(min-width: 1024px)").matches) {
          ScrollTrigger.create({
            trigger: pinSection,
            start: "top 80px",
            end: "bottom bottom",
            pin: pinTitle,
            pinSpacing: false,
          });
        }

        const marquee = document.querySelector<HTMLElement>("[data-marquee]");
        if (marquee) {
          const track = marquee.querySelector<HTMLElement>("[data-marquee-track]");
          if (track) {
            const distance = track.scrollWidth / 2;
            gsap.to(track, {
              x: -distance,
              ease: "none",
              duration: 38,
              repeat: -1,
            });
          }
        }
      });
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return null;
}
