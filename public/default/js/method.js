var $window = $(window),
        win_height_padded = $window.height() * 1.1;
    //isTouch = Modernizr.touch;
    $window.on('scroll', revealOnScroll);
    function revealOnScroll() {
        var scrolled = $window.scrollTop();
        $(".revealOnScroll:not(.animated)").each(function () {
            var $this = $(this),
                offsetTop = $this.offset().top;
            if (scrolled + win_height_padded > offsetTop) {
                if ($this.data('timeout')) {
                    window.setTimeout(function () {
                        $this.addClass('animated ' + $this.data('animation'));
                    }, parseInt($this.data('timeout'), 10));
                } else {
                    $this.addClass('animated ' + $this.data('animation'));
                }
            }
        });
        /*$(".revealOnScroll.animated").each(function (index) {
            var $this = $(this),
                offsetTop = $this.offset().top;
            if (scrolled + win_height_padded < offsetTop) {
                $(this).removeClass('animated fadeInUp flipInX lightSpeedIn bounceInLeft bounceInRight fadeInLeft')
            }
        })*/
    }
//滚动条距离顶部的距离
function srcoll_height(){
    $(window).scroll(function () {
        var st = $(this).scrollTop();
        console.log(st);
        if(st>98){
            $("#header-wrapper").removeClass("navi").addClass("nav_scroll");
        }else{
            $("#header-wrapper").removeClass("nav_scroll").addClass("navi");
        }
    });
}