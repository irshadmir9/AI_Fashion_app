document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const uploadButton = document.getElementById('uploadButton');
    const occasionInput = document.getElementById('occasionInput');
    const seasonInput = document.getElementById('seasonInput');
    const suggestButton = document.getElementById('suggestButton');
    const outfitResults = document.getElementById('outfitResults');

    uploadButton.addEventListener('click', async () => {
        const file = imageInput.files[0];
        if (!file) {
            alert('Please select a file first.');
            return;
        }

        // Let the user know something is happening
        console.log('Analyzing...');

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Send the image to our FastAPI backend
            const response = await fetch('/analyze-image/', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Something went wrong with the server.');
            }

            await response.json();

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to analyze the image. Please try again.');
        }
    });

    suggestButton.addEventListener('click', async () => {
        const occasion = occasionInput.value;
        const season = seasonInput.value;
        if (!occasion || !season) {
            outfitResults.textContent = 'Please select both occasion and season.';
            return;
        }
        outfitResults.textContent = 'Fetching outfit suggestions...';

        const url = `/suggest-outfit/?occasion=${occasion}&season=${season}`;

        try {
        const response = await fetch(url);
        const data = await response.json();

        // Clear the results area
        outfitResults.innerHTML = '';

        if (data.best_outfits || data.good_outfits) {
            const outfits = data.best_outfits || data.good_outfits;
            
            outfits.forEach(outfit => {
                const outfitDiv = document.createElement('div');
                outfitDiv.style.border = '1px solid black';
                outfitDiv.style.padding = '10px';
                outfitDiv.style.margin = '10px 0';
                
                const topP = document.createElement('p');
                topP.textContent = `Top: ${outfit.top.description}`;
                
                const bottomP = document.createElement('p');
                bottomP.textContent = `Bottom: ${outfit.bottom.description}`;
                
                outfitDiv.appendChild(topP);
                outfitDiv.appendChild(bottomP);
                outfitResults.appendChild(outfitDiv);
            });
        } else {
            outfitResults.textContent = data.message || 'No outfits found.';
        }
    } catch (error) {
        console.error('Error fetching outfit:', error);
        outfitResults.textContent = 'Failed to fetch outfit suggestions.';
    }
    });
        
});