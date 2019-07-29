/**
 * Created by JJW on 2016-11-16.
 */
window.onload = function() {

    //cache..
    var name = $("#name"),
        address = $("#address"),
        interestedPart = $("#interestedPart"),
        bodyType = $("#bodyType"),
        weakPart = $("#weakPart"),
        strongPart = $("#strongPart"),
        btnModify = $("#btnModify"),
        btnCancel = $("#btnCancel");


    //서버에 정보를 요청한다.
    $.post('/main/profile/request', function(data) {
        console.log(data);
        var userInfo = data.result;

        name.val(userInfo.name);
        address.val(userInfo.address);
        interestedPart.val(userInfo.interestedPart);
        bodyType.val(userInfo.bodyType);
        weakPart.val(userInfo.weakPart);
        strongPart.val(userInfo.strongPart);
    });

    btnModify.on('click', function(e){

        //서버에 정보를 요청한다.
        $.post('/main/profile/update', function(data) {
            console.log(data);
            $(location).attr('href', '/main');

        });

    }) ;

    btnCancel.on('click', function(e){

        $(location).attr('href', '/main');

    });

}