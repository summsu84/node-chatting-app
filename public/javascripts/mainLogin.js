/**
 * Created by JJW on 2016-11-15.
 */


window.onload = function() {

    //로그인 클릭시 연결시킨다..
    /*$('#pageSignup').on('pageshow', function(event) {

        console.log("pageSignup is show..");

    });*/

    $(document).on('pageshow', '[data-role=page]', function () {
        console.log("pageSignup is show..");
    });

    $('.connected').fadeIn(1200);

    $(".loginForm").on('submit', function (e) {

        e.preventDefault();     //서브밋 액션을 취소 시킨다.

        var username = $("#yourName").val();
        var userpassword = $("#yourPassword").val();

        $.post('/login2', {params: {username: username, password : userpassword}})
            .success(
                function (success) {
                    //console.log(success)
                    console.log("result : " + success.success)
                    $(location).attr('href', '/main');
                })
            .error(
                function (error) {
                    console.log(error)
                });
    });

    /** 회원 가입 버튼 클릭 시 회원 가입 창 띄운다.. **/

    $("#btnSiginUp").on('click', function(e){

        $("#dialogSiginUp").dialog({
            show:{
                effect : 'slide',
                complete: function(){
                    console.log("animia complete..");
                }
            },
            open: function(event, ui){
                console.log("dialog open..");

                $("#signUpForm").on('submit', function(e) {
                    console.log("btnclick111");
                    e.preventDefault();     //서브밋 액션을 취소 시킨다.

                    console.log("btnclick");
                    //post 요청
                    //서버에 접속자 정보를 요청한다.
                    var username = $("#username").val();
                    var name = $("#name").val();
                    var password = $("#password").val();
                    var interestedPart = $("#interestedPart").val();
                    var strongPart = $("#strongPart").val();
                    var bodyType = $("#bodyType").val();
                    var weakPart = $("#weakPart").val();
                    var address = $("#address").val();

                    console.log("btnclick 1");
                    $.post('/main/signup', {params: {username: username, name : name, password: password, address:address, interestedPart:interestedPart, strongPart:strongPart, bodyType:bodyType, weakPart : weakPart}})
                        .success(
                            function (success) {
                                //console.log(success)
                                console.log("result : " + success.success)
                               // $(location).attr('href', '/main');
                            })
                        .error(
                            function (error) {
                                console.log(error)
                            });

                });

            }
        });
    });





        /*
        //파라미터 파싱
        var username = $("#yourName").val();
        var userpassword = $("#yourPassword").val();

        var params = {username : username, userpassword : userpassword};
        var url = "/login/" + username + "/" + userpassword;


        $(location).attr('href', url);

    });*/
}