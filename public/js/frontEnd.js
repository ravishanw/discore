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

    // Animations
    
    $(".wave-mask").addClass("slideOut");
    function cursorAppear() {
        $(".vertical-line").removeClass("concealer");
        $(".vertical-line").addClass("blink");
    }
    function fadeFx() {
        $(".wave-mask").css("width","0");
        $(".link-container a").removeClass("concealer");
        $(".link-container a").addClass("fadeIn");
    }
    setTimeout(cursorAppear,"500");
    setTimeout(fadeFx,"2900");
    

});