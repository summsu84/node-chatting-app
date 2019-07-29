/**
 * Created by JJW on 2016-11-29.
 */
var global = 0;

function f1()
{
/*    console.log('fired: f1');
    global = 1;
    var obj = {
        username : "test",
        password : "test11"
    };
    var datToStore =JSON.stringify(obj);
    localStorage.setItem("value", datToStore);
    console.log('global changed to 1');*/

    //파일을 가져온다.
    $.post('/main/test2', function(data){
        console.log(data);

        $("#contents").append(data);

    });



}

function f2()
{
    console.log('fired f2');
    var result = JSON.parse(localStorage.getItem("value"));
    console.log('value of global: ' + global + ", result : " + result.username);
    result.username = "kevin";
    var datToStore =JSON.stringify(result);
    localStorage.setItem("value", datToStore);

}