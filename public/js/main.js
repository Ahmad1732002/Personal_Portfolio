





 
document.addEventListener('DOMContentLoaded',main);

function main(){


    if(window.location.pathname=='/'){
        let imageUrl;

        fetch('https://api.unsplash.com/search/photos?query=coding&per_page=20&order_by=popular&client_id=etlpcdufpiDkUxt1qEqTcseUe2_lMRd7nrcM__hnf8I')
        .then(response => response.json())
        .then(data => {
            const mostViewedPhoto = data.results.reduce((prev, current) => {
            return (prev.views > current.views) ? prev : current;
            });

            imageUrl = mostViewedPhoto.urls.full;
            document.querySelector('#templateBody').style.backgroundColor='transparent';
            document.querySelector('body').style.backgroundColor='transparent';
            const bod=document.querySelector('html');
            bod.style.backgroundImage = `url(${imageUrl})`;
            bod.style.backgroundSize = 'cover';
            bod.style.backgroundPosition = 'top';
            
            
        })
        .catch(error => {
            console.error(error);
        });  
    }

    



    
    if(window.location.pathname=='/feedback'){
        const feedbackBtn=document.querySelector('.submitFeedback');
        feedbackBtn.addEventListener('click',async function(evt){
            evt.preventDefault();
            const formData={};
            const formText=document.getElementById("feedback").elements["feedbackTxt"].value;
            const formName=document.getElementById("feedback").elements["feedbackName"].value;
            formData.reviewerName=formName;
            formData.reviewerFeedback=formText;

            console.log(formText);
            console.log(formName);


            await fetch('/feedback',{         
                method: "POST", 
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            }).then(response => console.log(response.status, response.statusText));

            const feedbacksList=document.querySelector('.feedbacks');
            const liElement = document.createElement('li');
            liElement.classList.add('list-group-item');

            const divElement1 = document.createElement('div');
            divElement1.classList.add('row');

            const divElement2 = document.createElement('div');
            divElement2.classList.add('col-md-6');

            const h4Element = document.createElement('h4');
            h4Element.textContent = formData.reviewerName;

        const divElement3 = document.createElement('div');
        divElement3.classList.add('col-md-6');

        const pElement = document.createElement('p');
        pElement.textContent = formData.reviewerFeedback;

        divElement2.appendChild(h4Element);
        divElement3.appendChild(pElement);
        divElement1.appendChild(divElement2);
        divElement1.appendChild(divElement3);
        liElement.appendChild(divElement1);

        feedbacksList.append(liElement)
    


        

    })
}
}
    

