let boxes = document.querySelectorAll('.box');
let reset = document.querySelector('#reset');

let turn0 = true;

const winningpatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [0, 4, 8],
];

function checkWinner() {
    for (let pattern of winningpatterns) {
        const [a, b, c] = pattern;
        if (
            boxes[a].innerText &&
            boxes[a].innerText === boxes[b].innerText &&
            boxes[a].innerText === boxes[c].innerText
        ) {
            // Winner found, disable all boxes
            boxes.forEach(box => box.disabled = true);
            // Announce the winner
            const winner = boxes[a].innerText;
            setTimeout(() => {
                alert(`🎉 Congratulations! Player ${winner} wins! 🎉`);
            }, 100);
            return true;
        }
    }
    return false;
}

boxes.forEach(box => {
    box.addEventListener('click', () => {
        console.log('clicked');
        if (turn0) {
            box.innerText = "0";
            turn0 = false;
        }
        else {
            box.innerText = "X";
            turn0 = true;
        }
        box.disabled = true;
        checkWinner(); // Check for winner after each move
    })
})



reset.addEventListener('click', () => {
    boxes.forEach(box => {
        box.innerText = "";
        box.disabled = false;
    });
    turn0 = true;
});