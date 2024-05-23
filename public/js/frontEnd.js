$(document).ready(()=>{
    
    // Hide navbar on welcome screen
    
    switch (window.location.pathname) {
        case "/review":
            $("nav").css("visibility","visible");
            break;

        case "/":
            $("nav").css("visibility","hidden");
            break;

        default:
            $(".nav-line").css("visibility","hidden");
            $(".brand-container img").css("display","none");
            $(".navbar-brand").text("Home");
            $("nav").css("display","flex");
            break;
    }

    // Footer copyright year

    let thisYear = new Date().getFullYear();
    $(".copy-year").text(thisYear);

    // Animations
    
    $(".wave-mask").addClass("slideOut");
    $(".terms-nav a").click(()=>{
        $(".terms-nav li").toggleClass("score-active");
        $(".tos-container").addClass("fadeIn");
        setTimeout(()=>{
            $(".tos-container").removeClass("fadeIn");
        }, 1500);
        $(".privacy-container").addClass("fadeIn");
        setTimeout(()=>{
            $(".privacy-container").removeClass("fadeIn");
        }, 1500);
    });
    
    function cursorAppear() {
        $(".vertical-line").removeClass("concealer");
        $(".vertical-line").addClass("blink");
    }
    function fadeFx() {
        $(".wave-mask").css("width","0");
        $(".link-container a").removeClass("concealer");
        $(".link-container a").addClass("fadeIn");
    }
    setTimeout(cursorAppear,500);
    setTimeout(fadeFx,2900);

    // Intersection observer

    let options = {
        rootMargin: "0px",
        threshold: 1.0,
        }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                $(".floating-rocket").css("visibility", "visible");
                $(".floating-rocket").addClass("fadeIn");
                setTimeout(() => {
                    $(".floating-rocket").removeClass("fadeIn");
                }, 1500);
            } else {
                $(".floating-rocket").css("visibility", "hidden");
            }
        });
    }, options);

    const scrollDivs = document.querySelector(".scroll-div");
    
    if (scrollDivs !== null) {
        observer.observe(scrollDivs);
    }
    
    

});