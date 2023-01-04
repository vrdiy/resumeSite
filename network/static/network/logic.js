document.addEventListener('DOMContentLoaded', function() {
 
    console.log("DOMContentLoaded");
    document.querySelector('#compose-post').onsubmit = try_post;
    
    let profileid = parseInt(document.querySelector('#profileid').innerHTML);
    profileid < 0 ? profileid = 0: '';
    document.querySelector('#showposts').addEventListener('click',()=> show_posts(profileid));
    try{
        document.querySelector('#following').addEventListener('click',()=> show_posts(undefined,undefined,true));
        }
        catch(typeerror){
    
        }
    try{
    document.querySelector('#followbutton').addEventListener('click',()=> follow_user(profileid));
    }
    catch(typeerror){

    }
    show_posts(profileid);
    
});

//my helper functions 
//-----------------------------------------
function boldThisHTML(str){
    const bolded = document.createElement('b')
    bolded.innerHTML = str;
    return bolded;
  }
  
  function line_break(){
      return document.createElement('br');
  }

  function name_links(id,username){
    const namelink = document.createElement('strong');
    namelink.innerHTML = `${username}`;
    namelink.setAttribute("id",`nameButton-${id}`);
    return namelink;
    
}

function page_bootstrap(id,currentpage){
    
    paginationbootstrap = document.createElement('nav');
    paginationbootstrap.setAttribute('aria-label', '...');
    paginationunorderedlist = document.createElement('ul');
    paginationunorderedlist.setAttribute('class','pagination');
    
    if(currentpage.has_previous){
        paginationunorderedlist.innerHTML += `<li class="page-item">
        <a class="page-link" href="javascript:show_posts(${id},${Number(currentpage.page_num)-1})">Previous</a>
        </li>`
    }else{
        paginationunorderedlist.innerHTML += `<li class="page-item disabled">
        <a class="page-link" href="" tabindex="-1" aria-disabled="true">Previous</a>
        </li>`
    }
    
    for(let i = 1; i <= Number(currentpage.num_pages); i++){
        paginationunorderedlist.innerHTML += `<li class="page-item ${(i === Number(currentpage.page_num)? 'active' : '')}">
        <a class="page-link" href="javascript:show_posts(${id},${i})">${i}</a>
        </li>`;
    }
    
    if(currentpage.has_next){
        paginationunorderedlist.innerHTML += `<li class="page-item">
        <a class="page-link" href="javascript:show_posts(${id},${Number(currentpage.page_num)+1})">Next</a>
        </li>`;
    }else{
        paginationunorderedlist.innerHTML += `<li class="page-item disabled">
        <a class="page-link" href="" tabindex="-1" aria-disabled="true">Next</a>
        </li>`;
    }
    
    paginationbootstrap.append(paginationunorderedlist);
    return paginationbootstrap;
    
    
}
//-----------------------------------------

function like_post(id){
    fetch(`/likepost/${id}`,{
        method: 'POST',
        body: ""
        })

    .then(response => {
        if(response.status === 401){
            window.location.replace("/login");
        }
        console.log(`like_post status: ${response.status}`);
        return response;
    })
    .then(response => response.json())
    .then(result => {
        if(result.likestatus === '1'){
        document.querySelector(`#post-${id}`).src = likebuttonimg;
        document.querySelector(`#post-${id}-likes`).innerHTML = parseInt(document.querySelector(`#post-${id}-likes`).innerHTML)+1;
        
        }
        else if(result.likestatus === '0'){
            document.querySelector(`#post-${id}`).src = haventlikedbuttonimg;
            document.querySelector(`#post-${id}-likes`).innerHTML = parseInt(document.querySelector(`#post-${id}-likes`).innerHTML)-1;
        }
        console.log(result.message)
    })
    
}

function edit_post(id){
    const posttoedit = document.querySelector(`#editpost-${id}`).parentElement;
    postcontent = posttoedit.querySelector(".postinnercontent");
    const postcontentvalue = postcontent.innerHTML;
    postcontent.style.display = 'none';
    const editdiv = posttoedit.querySelector(`#contentdiv-${id}`);
    const savebutton = document.createElement('button');
    savebutton.setAttribute("id",`save-form-button-${id}`);
    savebutton.style.backgroundColor = '#d1f7c3' //pale green
    savebutton.style.color = 'grey';
    savebutton.addEventListener('click', ()=> try_edit(id,document.querySelector(`#editedcontent-${id}`).value));
    savebutton.innerHTML = 'Save';
    const editarea = document.createElement('textarea');
    editarea.setAttribute("id",`editedcontent-${id}`);
    editarea.style.width = '80vw';
    editarea.style.color = '#5e3108';
    editarea.value = postcontentvalue;
    editdiv.insertAdjacentElement('beforebegin',editarea);
    editdiv.insertAdjacentElement('beforebegin',savebutton);
   

    
}

function try_edit(postid, textcontent){
    
    fetch('/editpost',{
        method: 'POST',
        body: JSON.stringify({
            textcontent: textcontent,
            postid: postid
        })

  })
  .then(response => {
    if(response.status === 401){
        window.location.replace("/login");
    }
    if(response.status === 201){
        
        return response;
    }})
    .then(response => response.json())
    .then(result => {
        const posttoedit = document.querySelector(`#editpost-${postid}`).parentElement;
        postcontent = posttoedit.querySelector(".postinnercontent");
        postcontent.innerHTML = result.textcontent;
        postcontent.style.display = 'block';
        document.querySelector(`#editedcontent-${postid}`).remove();
        document.querySelector(`#save-form-button-${postid}`).remove();
        console.log(result);
  })

  return false;
}

function follow_user(id){
    fetch(`/followuser/${id}`,{
        method: 'POST',
        body: ""
        })

        .then(response => {
            if(response.status === 401){
                window.location.replace("/login");
            }
            console.log(`follow_user status: ${response.status}`);
            return response;
        })
    .then(response => response.json())
    .then(result => {
        if(result.followstatus === '1'){
        document.querySelector(`#followbutton`).innerHTML = "Unfollow";
        document.querySelector(`#followercount`).innerHTML = parseInt(document.querySelector(`#followercount`).innerHTML)+1;
        
        }
        else if(result.followstatus === '0'){
            document.querySelector(`#followbutton`).innerHTML = "Follow";
            document.querySelector(`#followercount`).innerHTML = parseInt(document.querySelector(`#followercount`).innerHTML)-1;
        }
        console.log(result.message)
    })
    
}


function show_posts(userid=0,pagenum=1,following = false){

    const postsdiv = document.querySelector('#posts');
    postsdiv.style.display = 'block';
    postsdiv.innerHTML = '';

    if(following){history.replaceState("","","/");
        followingheader = document.createElement('strong');
        followingheader.innerHTML = "Following";
        followingheader.setAttribute("style","font-size: 35px; color: #b5b399;");
        postsdiv.append(followingheader);
    }
    document.querySelector('#compose-post').style.display = 'none';
    if((userid === 0)&&(!following)){
    const newpostbutton = document.createElement('button');
    newpostbutton.addEventListener('click', compose_post);
    newpostbutton.setAttribute("id","newpost");
    newpostbutton.innerHTML = "New Post";
    postsdiv.append(newpostbutton);
    }

    document.querySelector('#text-content').value = '';

    if(following){
        profilediv = document.querySelector('#profile');
        profilediv.style.display = 'none';
        profilediv.innerHTML = '';
    }

    fetch(`/getposts/${userid}?page_number=${pagenum}&following=${following}`)
    .then(response => {
        if(response.status != 201){return false;}
        else{
            return response.json();
        }
        })
    .then(posts => {
        if(posts){
        //There is meta data in a dict at the end of the response
        console.log(posts)

        paginationdiv = document.createElement('div');
        paginationdiv.append(page_bootstrap(userid,posts[posts.length-1]));

        if(posts.length < 2){
            postsdiv.append("No Posts!");
        }
        posts.pop();
        //console.log(posts);
        posts.forEach(element =>{
            counter = 0;
            for(let like in element.likes){
                counter++;
            }

            const singlePost = document.createElement('div');
            singlePost.className = "post";

            const contentdiv = document.createElement('div');
            contentdiv.setAttribute("id",`contentdiv-${element.id}`)
            const textcontent = document.createElement('p');
            
            textcontent.innerHTML = `${element.textcontent}`;
            textcontent.className = "postinnercontent";

            const namelink = document.createElement('a');
            namelink.innerHTML = `${element.user}`;
            namelink.setAttribute("id",`nameButton-${element.user}`);
            namelink.setAttribute("href",`/profile/${element.userid}`);
           // namelink.addEventListener('click', () => load_profile(element.userid));

            const meta = document.createElement('p');
            meta.append("Posted by ");
            meta.innerHTML += `\n<span id="post-${element.id}-likes">${counter}</span> likes\n${element.timestamp}\n`;

            
            meta.style.borderBottom = '1px solid grey';
            
            //likebutton
            const likebutton = document.createElement('input');
            likebutton.setAttribute("id",`post-${element.id}`);
            likebutton.addEventListener('click',() => like_post(element.id));
            likebutton.type = "image";
            
            if(element.userhasliked){
                likebutton.src = likebuttonimg;
            }
            else{
                likebutton.src = haventlikedbuttonimg;
            }
            


            //editbutton
            const editbutton = document.createElement('input');
            editbutton.setAttribute("id",`editpost-${element.id}`);
            editbutton.addEventListener('click', ()=> edit_post(element.id));
            editbutton.type = "image";
            editbutton.src = editbuttonimg;


            singlePost.append(meta);
            contentdiv.append(textcontent);
            singlePost.append(contentdiv);
            element.ownpost ? singlePost.append(editbutton) : null;
            singlePost.append(likebutton);
            singlePost.append(namelink);

            postsdiv.append(singlePost);
            postsdiv.append(paginationdiv);
        })
    }
    })

}

function compose_post(){

    document.querySelector('#compose-post').style.display = 'block';
    document.querySelector('#posts').style.display = 'none';


}


function try_post(){
    const posttext = document.querySelector('#text-content').value;

    fetch('/newpost',{
        method: 'POST',
        body: JSON.stringify({
            textcontent: posttext
        })

  })
  .then(response => {
    if(response.status === 401){
        window.location.replace("/login");
    }
    console.log(`try_post status: ${response.status}`);
    return response;
})
  .then(response => response.json())
  .then(result => {
    console.log(result);
    show_posts();
  })

  return false;

}

