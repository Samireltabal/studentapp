// document.addEventListener("DOMContentLoaded", function(event) {
//     const element = document.createElement('h1')
//     element.innerHTML = "Hello World"
//     document.body.appendChild(element)
// })

import $ from 'jquery';
import boostrap from 'bootstrap';
import moment from 'moment';
require('popper.js');
import './index.css';
import { mqttInit } from './js/mqtt';
import { initClass,  fetchChat } from './js/axios';
import axios from 'axios';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const classId = urlParams.get('classId')
const apiToken = urlParams.get('token')
var User;
var Client; 
initClass(apiToken).then((response) => {
    User = response.data
    localStorage.setItem('user', JSON.stringify(response.data));
    $('#userName').text(response.data.name);
    fetchChat(apiToken, classId, User);
    Client = mqttInit(apiToken,classId, User);
    handleForm();
});

function handleForm (){
    $('#attachButton').click(function(){ $('#fileForm').trigger('click'); });
    $('#fileForm').on('change', function(e) {
        $('#fileName').text(e.target.files[0].name);
    });
    $('#sendChat').on('click', function() {
        const headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': apiToken
        }
        var data = new FormData();
        data.append('content', $('#chatMessage').val());
        data.append('stream_id', classId);
        data.append('file', $('input#fileForm')[0].files[0]);

        axios.post('https://api.futurelines.net/api/v2/class/chat/add', data, {headers: headers}).then((response) => {
            fetchChat(apiToken, classId, User).then(() =>{
                $('#chatMessage').val('')
                $('input#fileForm').val('')
            })
        }).catch((err) => {

        })
    })
}

$(document).ready(function(){
    $('#action_menu_btn').click(function(){
        $('.action_menu').toggle();
    });
    $('#action_menu_btn_2').click(function(){
        $('.action_menu_2').toggle();
    });
    $('#closeRoom').on('click', function () {
        window.close()
    });
    $('#teacherStream').html(`
        <iframe height="80%" width="100%" src="https://stream.futurelines.live:5443/WebRTCAppEE/play_embed.html?name=${classId}" frameborder="0" allowfullscreen></iframe>
    `);

    $('#raiseHand').on('click', function () {
        var obj = {
            order: 'RAISE_HAND',
            uuid: User.uuid
        }
        console.log(obj)
        Client.publish('/class/' + classId + "/orders", JSON.stringify(obj));
    })
    $('#lowerHand').on('click', function () {
        var obj = {
            order: 'LOWER_HAND',
            uuid: User.uuid
        }
        console.log(obj)
        Client.publish('/class/' + classId + "/orders", JSON.stringify(obj));
    })
});

