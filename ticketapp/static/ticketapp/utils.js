//the function to call needs it's first argument to be the page number
function page_bootstrap(currentpage,stringNameOfFunctionToCall){
    
    paginationbootstrap = document.createElement('nav');
    paginationbootstrap.setAttribute('aria-label', '...');
    paginationunorderedlist = document.createElement('ul');
    paginationunorderedlist.setAttribute('class','pagination');
    
    if(currentpage.has_previous){
        const li = document.createElement('li');
        li.setAttribute('class','page-item');

        const a = document.createElement('a');
        a.setAttribute('class','page-link');
        a.setAttribute('href',`javascript:${stringNameOfFunctionToCall}(${currentpage.page_num -1})`);
        a.innerHTML = 'Previous';
        li.append(a);
        paginationunorderedlist.append(li);
    }else{
        const li = document.createElement('li');
        li.setAttribute('class','page-item disabled');

        const a = document.createElement('a');
        a.setAttribute('class','page-link');
        a.setAttribute('href','');
        a.setAttribute('aria-disabled','true');
        a.setAttribute('tabindex','-1');
        a.innerHTML = 'Previous';
        li.append(a);
        paginationunorderedlist.append(li);
    }
    
    for(let i = Number(currentpage.page_num)-4; i <= Number(currentpage.page_num)+4; i++){
        if((i <= 0)||(i > Number(currentpage.num_pages))){
            
        }
        else{

            const li = document.createElement('li');
            li.setAttribute('class',`page-item ${(i === Number(currentpage.page_num)? 'active' : '')}`);
            
            const a = document.createElement('a');
            a.setAttribute('class','page-link');
            a.setAttribute('href',`javascript:${stringNameOfFunctionToCall}(${i})`);
            a.innerHTML = i;
            
            li.append(a);
            paginationunorderedlist.append(li);
        }
    }
    
    if(currentpage.has_next){
        const li = document.createElement('li');
        li.setAttribute('class','page-item');

        const a = document.createElement('a');
        a.setAttribute('class','page-link');
        a.setAttribute('href',`javascript:${stringNameOfFunctionToCall}(${currentpage.page_num +1})`);
        a.innerHTML = 'Next';
        li.append(a);
        paginationunorderedlist.append(li);
    }else{
        const li = document.createElement('li');
        li.setAttribute('class','page-item disabled');

        const a = document.createElement('a');
        a.setAttribute('class','page-link');
        a.setAttribute('href','');
        a.setAttribute('aria-disabled','true');
        a.setAttribute('tabindex','-1');
        a.innerHTML = 'Next';
        li.append(a);
        paginationunorderedlist.append(li);
    }
    
    paginationbootstrap.append(paginationunorderedlist);
    return paginationbootstrap;
    
    
}