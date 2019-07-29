/**
 * Created by JJW on 2016-11-22.
 */
$(function(){

    //Init
    var currentTab = 1;
    var cntTab = 1;
    //버튼 Init
    console.log("function Start...");
    var btnTabAdd = $("#btnTabAdd"),
        btnExAdd = $(".btnExAdd"),
        btnExDel = $(".btnExDel"),
        btnExReg = $("#btnExReg"),
        btnExInit = $("#btnExInit"),
        btnExCancel = $("#btnExCancel"),
        btnPartAdd = $("#btnPartAdd"),
        btnPartDel = $("#btnPartDel");
    //div init
    var divExList = $("#divExList"),
        tcExDay_1 = $("#tcExDay_1"),
        tcExDay_2 = $("#tcExDay_2"),
        tcExDay_3 = $("#tcExDay_3"),
        tcExDay_4 = $("#tcExDay_4"),
        tcExDay_5 = $("#tcExDay_5"),
        tcExDay_6 = $("#tcExDay_6"),
        tcExDay_7 = $("#tcExDay_7"),
        tblExDay_1 = $("#tblExday_1"),
        tblExDay_2 = $("#tblExday_2"),
        tblExDay_3 = $("#tblExday_3"),
        tabNav = $(".nav"),
        selPart = $("#selPart"),
        tab1 = $("#tab_1"),
        tab2 = $("#tab_2"),
        tab3 = $("#tab_3"),
        tab4 = $("#tab_4"),
        tab5 = $("#tab_5"),
        tab6 = $("#tab_6"),
        tab7 = $("#tab_7"),
        partListGroup = $("#divPartListGroup");

    //global var
    var g_partList = new Array();
    var g_selPart;



    //button Init
    initRequest();
    buttonInit();

    /**
     *  페이지 생성시 최초 실행되는 함수이며, 사용자가 스케줄을 등록했는지 확인한다.
     */
    function initRequest()
    {
        //나중에 ajax로 대체 예정..
        //사용자가 등록한 스케줄 정보를 불러온다.
        $.post('/main/schedule/init', function(data){
            console.log(data);
            //데이터를 받아온다..부위
            var resultArray = data.result;

            updateUserSchedule(resultArray);

        });

        requestPartNameInit();
    }

    /**
     *  Partname 정보를 서버로 요청하여 받아 온다.
     */
    function requestPartNameInit()
    {
        //현재 part에 인덱싱 한다. 마지막 인덱싱
        var partLastIdx = $("#divPartListGroup .part-list").length;
        console.log("requestPartnameInit.. " + partLastIdx);
        //var partLastSelector = $("#partList_" + partLastIdx + " #selPart") ;
        var partLastSelector = $("#partList_" + partLastIdx);
        requestPartName(partLastSelector);
    }

    /**
     *  실제로 서버로 부터 part name을 받아온다..
     * @param lastSelPart <div class="part-list" id="partList_1">
     */
    function requestPartName(lastSelPart)
    {
        var l_selPart = lastSelPart.find('#selPart');
        var divExList = lastSelPart.find("#divExList");
        console.log("requestPaaramname.. called..selector : " + l_selPart);
        $.post('/main/schedule/requestPart', function(data){
            console.log(data);
            //데이터를 받아온다..부위
            var resultArray = data.result;

            var option = document.createElement("option");
            option.text = "";
            option.value = 0;
            l_selPart.append(option);


            for(var i in resultArray)
            {
                var option = document.createElement("option");
                option.text = resultArray[i];
                option.value = resultArray[i];

                l_selPart.append(option);
            }

            //Exercise 부분 값 가져오기..이벤트 등록하기..
            l_selPart.on('change', function(e){
                //requestPartEx..
                console.log("change click");
                if($(this).val() !== 0) {
                    //Ex Selector을 보내야 한다..
                    var divPartList = $(this).closest('.part-list');            //상위 클래스 중 한개 찾기.
                    console.log("divpart : " + divPartList);
                    var divExList = divPartList.find("#divExList");
                    requestPartExInit($(this).val(), divExList);
                }
            });
        });
    }

    /**
     * 파트별 Ex Name을 가져온다.
     * @param name 파트 이름
     */
    function requestPartExInit(partName, divExList)
    {
        //Selector 정하기..

        console.log("requestPartExInit.. called.. + selected value : " + partName + ", divId : " + divExList.attr('id'));

        //먼저 Ex들을 모두 Empty 시킨다.
        //part Selector의 상위 태그에서 Ex 태그로 접근한다.

        // $("select").each(function(){
        divExList.find('select').each(function (){
            console.log("selEx .. : " + $(this).attr('name'));
            if($(this).attr('id') === 'selEx') {
                $(this).empty();
            }else if($(this).attr('id') === 'selSet') {
                $(this).empty();
            }
        });
        console.log("requestPartExInit.. divExList : " + divExList);
        requestPartEx(partName, divExList);
    }

    function requestPartEx(name, divExList)
    {
        $.post('/main/schedule/requestPartEx', {params: {partName: name}})
            .success(
                function (success) {
                    //console.log(success)
                    var resultArray = success.result;


                    // $("select").each(function(){
                    divExList.find('select').each(function(){
                        console.log("selEx .. : " + $(this).attr('name'));
                        if($(this).attr('id') === 'selEx') {
                            for (var i in resultArray) {
                                var exName = resultArray[i].name;
                                var option = document.createElement("option");
                                option.text = exName;
                                option.value = exName;
                                $(this).append(option);
                            }
                        }else if($(this).attr('id') === 'selSet') {
                            for (var i = 0; i < 5 ; i++) {
                                var option = document.createElement("option");
                                option.text = i+1;
                                option.value = i+1;
                                $(this).append(option);
                            }
                        }
                    });
                })
            .error(
                function (error) {
                    console.log(error)
                });
    }



    function buttonInit()
    {
        console.log("buttonInit Start...");
        //Tab Add
        tcExDay_1.css('display', 'block');
        initTabEvent(tab1, tcExDay_1);
        btnTabAdd.on('click', function(e){

            createTab();
        });

        //ExList Add
/*        btnExAdd.on('click', function (e){

            //create ex div
            createExList();
        });*/
        initExButtonEvent();

        btnExReg.on('click', function(e){

            //register exlist
            //tcExDay_1.css('display', 'block');
            registerExList();
        });

        btnExDel.on('click', function(e){
           //Remove Ex List

            removeExList();
        });

        //Part Add
        btnPartAdd.on('click', function (e) {
            addPart();
        })

        //Part Del
        btnPartDel.on('click', function (e) {
            removePart();
        })
    }

    // var onExButtonClicked = createExList();

    //ex button event handler...
    function initExButtonEvent()
    {
        console.log("initExButtonEvent is called");
        //event remove
        $(".btnExAdd").each(function (){
            $(this).off('click', function(){
                createExList(divExList);
            });
        });

        $(".btnExAdd").each(function (){
            var divPartList = $(this).closest('.part-list');            //상위 클래스 중 한개 찾기.
            console.log("divpart : " + divPartList);
            var divExList = divPartList.find("#divExList");
            //$(this).off('click', createExList(divExList)).on('click', createExList(divExList));
            $(this).on('click', function(){
                createExList(divExList);
            });
        });

        console.log("initExButtonEvent is closed");
    }

    //Tab 생성한다.
    function createTab()
    {
        var cntNextTab = cntTab + 1;
        var tmpTab, tmpContent
        console.log("cntNextTab = " + cntNextTab);
        //붙이기
        if(cntNextTab == 2)
        {
            tmpTab = tab2;
            tmpContent = tcExDay_2;
        }else if(cntNextTab == 3)
        {
            tmpTab = tab3;
            tmpContent = tcExDay_3;
        }
        else if(cntNextTab == 4)
        {
            tmpTab = tab4;
            tmpContent = tcExDay_4;

        }else if(cntNextTab == 5)
        {
            tmpTab = tab5;
            tmpContent = tcExDay_5;
        }else if(cntNextTab == 6)
        {
            tmpTab = tab6;
            tmpContent = tcExDay_6;
        }else if(cntNextTab == 7)
        {
            tmpTab = tab7;
            tmpContent = tcExDay_7;
        }

        tmpTab.parent().removeClass("hidden");
        tmpTab.parent().addClass("visible");
        cntTab += 1;
        initTabEvent(tmpTab, tmpContent);

    }

    function initTabEvent(tmpTab, tmpContent)
    {
        tmpTab.on('click', function (e){

            currentTab = tmpTab.parent().attr('num');
            console.log("main tab clicked..num : " + currentTab);

            $(".tablinks").each(function(){
                //console.log($(this).html() + "\n");
                $(this).parent().removeClass("active");
            });

            $(".formContents .panel").each(function(){
                $(this).css('display', 'none');
            });
            tmpContent.css('display', 'block');

            $(this).parent().addClass("active");
        })
    }

    //ExList를 생성한다.
    function createExList(divExList)
    {
        console.log("createExList is called.");
        var exDiv = createExDivHtml();
/*            "<div class='form-group'>" +
            "<label class='col-md-4 control-label' for='selEx'>NAME</label>" +
            "<div class='col-md-5'>" +
            "<select id='selEx' name='selEx' class='form-control'>" +
            "</select>" +
            "</div>" +
            "<label class='col-md-4 control-label' for='selSet'>SET</label>" +
            "<div class='col-md-5'>" +
            "<select id='selSet' name='selSet' class='form-control'>" +
            "</select>" +
            "</div>" +
            "</div>";*/

        //어떤 ExList div를 선택할지 결정한다..

        divExList.append(exDiv);

        //post 연결하여, 데이터를 가져온다..
        var divPartList = divExList.closest('.part-list');            //상위 클래스 중 한개 찾기.
        //파트에 따른 ExName을 가져오자..
        //var partName = selPart.val();
        var partName = divPartList.find('#selPart').val();
        console.log("partname : " + partName);
        requestPartEx(partName, divExList);            //exList도 파라미터..

    }

    function createExListToJson()
    {
        //파트 입력 내용을 json 파일로 생성한다.

/*        var objList = new Array();
        var cntPartList = $("#divPartListGroup .part-list").length;

        for(var i = 0 ; i < cntPartList ; i++)
        {
            var obj = {};
            obj.day = i + 1;
            var exArray = new Array();
            var divPartList = "#partList_" + (i + 1);
            var exPartName = divPartList.find("#div")
        }*/
        var objList = new Array();
        var objPartListGroup = {};
        var idx = 1;
        objPartListGroup.day = idx;
        var objPartList = new Array();
        $("#divPartListGroup .part-list").each(function () {

            var obj = {};

            var divPart = $(this).find("#divPart");
            obj.partName = divPart.find("#selPart").val();
            var divExList = $(this).find("#divExList");
            var exListArray = new Array();                  //ExList

            divExList.find(".form-group").each(function () {
                var exObj = {};
                var exName = $(this).find("#selEx").val();
                var exEa = $(this).find("#selEa").val();
                var exSet = $(this).find("#selSet").val();

                exObj.exName = exName;
                exObj.exEa = exEa;
                exObj.exSet = exSet;

                exListArray.push(exObj);
            });
            obj.exList = exListArray;
            objPartList.push(obj);
        })
        objPartListGroup.ex = objPartList;
        objList.push(objPartListGroup);

/*
        var partName = $("#selPart").val();
        obj.partName = partName;
        var exArray = new Array();
        console.log("main clicked..");
        $("#divExList .form-group").each(function(){
            //console.log($(this).html() + "\n");
            var ex = {};
            $(this).find('select').each(function(){
                console.log("value : " + $(this).val());

                if($(this).attr('id') === "selEx")
                {
                    //name
                    console.log("selEx!");
                   ex.exName = $(this).val();
                }else{
                    //set
                   ex.exSet = $(this).val();
                    console.log("selExSet!");
                }

            })
            exArray.push(ex);
        });
        obj.exList = exArray;
        for(var i in exArray)
        {
            console.log("exArray... : " + exArray[i].exName + " , set : " + exArray[i].exSet);
        }*/
        console.log("objPartListGroup : " + objList);
        return objPartListGroup;
    }




    function registerExList() {
        //현재 탭의 위치를 판단한다.
        var exObj = createExListToJson();
        var tmpTbl = getCurrentTbl();

        tmpTbl.find('tbody').empty();
        //create table..
/*        var trPart =
            "<tr>" +
            "<td colspan='3'> " + exObj.partName + " </td>" +
            "</tr>";

        tmpTbl.find('tbody').append(trPart);*/

        updateExListToTable(tmpTbl, exObj);
        /*

        var exList = exObj.exList;
        for(var i in exList)
        {
            var ex = exList[i];
            var tr =
                "<tr name='exName' rowNum="+i+">" +
                "<td> " + i + " </td>" +
                "<td>" + ex.exName + "</td>" +
                "<td>" + "10" + "</td>" +
                "<td>" + ex.exSet + "</td>" +
                "</tr>";

            tmpTbl.find('tbody').append(tr);
        }

        //event..
        tblExDay_1.find('tr').each(function () {
            if($(this).attr('name') === 'exName') {

                $('tr').not(':first').hover(
                    function(){
                        $(this).css("background", "yellow");
                    },
                    function(){
                        $(this).css("background", "");
                    }
                );

                console.log("tr...: " + $(this).val());
                //이벤트 추가 하기.
                $(this).on('click', function(){
                   console.log("rowNum : " + $(this).attr("rowNum"));
                });
            }
        });*/

    }

    /**
     *  Ex List를 제거한다.
     */
    function removeExList(){

        //divExList의 개수를 파악한다.
        var exCnt =  $("#divExList .form-group").length;

        //divExList의 마지막 form group을 제거한다.
        if(exCnt > 1)
            $("#divExList .form-group:last-child").remove();


    }

    function getCurrentTbl()
    {
        var tmpTbl;
        if (currentTab == 1) {
            tmpTbl = tblExDay_1;
        }else if(currentTab == 2){
            tmpTbl = tblExDay_2;
        }else if(currentTab == 3){
            tmpTbl = tblExDay_3;
        }

        return tmpTbl;
    }

    /**
     * 스케줄 정보 클릭시, 서버로 부터 사용자의 스케줄 정보를 가져온다.
     * @param data
     */
    function updateUserSchedule(data)
    {
        //사용자의 스케줄을 업데이트 한다.
        var idx = 1;
        for(var i in data)
        {
            var scArray = data[i];

            var tblName = "#tblExday_" + idx;
            var tabName = "#tab_" + idx;

            $(tabName).parent().removeClass("hidden");
            var tmpTbl = $(tblName);
            updateExListToTable(tmpTbl, scArray);
            idx++;
        }
    }

    //정보를 일자별 테이블에 적용한다.
    function updateExListToTable(tmpTbl, scArray)
    {
        //나중에 파트가 배열인경우 고려하기!!
        var exList = scArray.ex;
        for(var i in exList) {
            var ex = exList[i];

            var trPart =
                "<tr>" +
                "<td colspan='4'> " + ex.partName + " </td>" +
                "</tr>";

            tmpTbl.find('tbody').append(trPart);

            var partExList = ex.exList;
            for (var i in partExList) {
                var partEx = partExList[i];
                var tr =
                    "<tr name='exName' rowNum=" + i + ">" +
                    "<td> " + i + " </td>" +
                    "<td>" + partEx.exName + "</td>" +
                    "<td>" + partEx.exEa + "</td>" +
                    "<td>" + partEx.exSet + "</td>" +
                    "</tr>";

                tmpTbl.find('tbody').append(tr);
            }
/*
            //event..
            tblExDay_1.find('tr').each(function () {
                if ($(this).attr('name') === 'exName') {

                    $('tr').not(':first').hover(
                        function () {
                            $(this).css("background", "yellow");
                        },
                        function () {
                            $(this).css("background", "");
                        }
                    );

                    console.log("tr...: " + $(this).val());
                    //이벤트 추가 하기.
                    $(this).on('click', function () {
                        console.log("rowNum : " + $(this).attr("rowNum"));
                    });
                }
            });*/
        }
    }

    //Part Add
    function addPart()
    {
        //partList selector..
        var newPartDiv = createPartDivHtml();
        var newExDiv = createExDivHtml();

        //partList Div creation..
        var partCnt = $("#divPartListGroup .part-list").length;
        var newPartListId = "partList_" + (partCnt + 1);
        var newPartList =
            "<div class='part-list' id='" + newPartListId +"'>" +
                newPartDiv +
                newExDiv +
            "</div>";

        console.log("newPartList : " + newPartList);


        partListGroup.append(newPartList);
        initExButtonEvent();
        //파트에 따른 ExName을 가져오자..
/*        var partName = selPart.val();
        requestPartEx(partName);*/
        requestPartNameInit()
    }

    function removePart()
    {
        //divExList의 개수를 파악한다.
        var partListCnt =  $("#divPartListGroup .part-list").length;

        //divExList의 마지막 form group을 제거한다.
        if(partListCnt > 1)
            $("#divPartListGroup .part-list:last-child").remove();
    }



    /**
     *  Part Div html을 생성한다.
     */
    function createPartDivHtml()
    {
        var partDiv =
            "<div id='divPart'>" +
            "<div class='form-group'>"+
            "<label class='col-md-4 control-label' for='selPart'>PART</label>" +
            "<div class='col-md-5'>" +
            "<select id='selPart' name='selPart' class='form-control'>" +
            "</select>" +
            "</div>" +
            "</div>" +
            "<input type='button' class='btnExAdd' id='btnExAdd' value='더하기' />" +
            "<input type='button' class='btnExDel' id='btnExDel' value='빼기' />" +
            "</div>";

        return partDiv;
    }

    /**
     *  Ex Div html을 생성한다.
     */
    function createExDivHtml()
    {
        var exDiv =
            "<div id='divExList'>" +
            "<div class='form-group'>" +
            "<label class='col-md-4 control-label' for='selEx'>NAME</label>" +
            "<div class='col-md-5'>" +
            "<select id='selEx' name='selEx' class='form-control'>" +
            "</select>" +
            "</div>" +
            "<label class='col-md-4 control-label' for='selEa'>EA</label>" +
            "<div class='col-md-5'>" +
            "<select id='selEa' name='selEa' class='form-control'>" +
            "<option value='1'> 1 </option>"+
            "<option value='2'> 2 </option>"+
            "<option value='3'> 3 </option>"+
            "<option value='4'> 4 </option>"+
            "<option value='5'> 5 </option>"+
            "<option value='6'> 6 </option>"+
            "<option value='7'> 7 </option>"+
            "</select>" +
            "</div>" +
            "<label class='col-md-4 control-label' for='selSet'>SET</label>" +
            "<div class='col-md-5'>" +
            "<select id='selSet' name='selSet' class='form-control'>" +
            "</select>" +
            "</div>" +
            "</div>" +
            "</div>";

        return exDiv;
    }


    /**
     * 파트에 따른 Ex 정보를 가져온다.
     */
    function requestExInfo()
    {
        //post 연결하여, 데이터를 가져온다..

        //파트에 따른 ExName을 가져오자..
        var partName = selPart.val();
        requestExInfo(partName);
    }
    function requestExInfo(partName)
    {
        requestPartEx(partName);
    }

    /**
     *  파트 정보를 가져온다.
     */
    function requestPartInfo()
    {
        //post 연결하여, 데이터를 가져온다..

        //파트에 따른 ExName을 가져오자..
        var partName = selPart.val();
        requestPartEx(partName);
    }
});

