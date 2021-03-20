App = {
    loading: false,
    contracts: {},

    load: async () => {
        await App.loadWeb3();
        await App.loadAccount();
        await App.loadContract();
        await App.render();
    },

    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            window.alert("Please connect to Metamask.");
        }
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            try {
                // Request account access if needed
                await ethereum.enable();
                // Acccounts now exposed
                web3.eth.sendTransaction({
                    /* ... */ });
            } catch (error) {
                // User denied account access...
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider;
            window.web3 = new Web3(web3.currentProvider);
            // Acccounts always exposed
            web3.eth.sendTransaction({
                /* ... */ });
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
    },

    loadAccount: async () => {
        const accounts = await web3.eth.getAccounts();
        App.account = accounts[0];
    },

    loadContract: async () => {
        var dTodoAddress = "0xA21eD590784E4a83AbdACC304373d57fd14A61FD";
        App.contracts.dTodo = new web3.eth.Contract(abi, dTodoAddress);
    },

    render: async () => {
        if (App.loading) {
            return;
        }

        App.setLoading(true);

        $('#account').html(App.account);

        await App.renderTodos();

        App.setLoading(false);
    },

    renderTodos: async () => {
        const todoCount = await App.contracts.dTodo.methods.todosCount(App.account).call();

        for (var i = 0; i < todoCount; i++) {
            const todo = await App.contracts.dTodo.methods.todos(App.account, i).call();
            const todoDate = new Date(Number(todo.time)*1000);
            let gotTodo = document.createElement('li');
            gotTodo.className = `${i} list-group-item ${(todo.completed===true)?'disabled':''}`;
            gotTodo.onclick = function(e) { App.toggleCompleted(e); };
            gotTodo.innerHTML = `<div style="display: flex; justify-content: space-between;" class="${i}">
                <div class="${i}">${todo.content}</div>
                <div class="${i} text-muted">${todoDate.toDateString()}</div>
            </div>`
            $('.list-group').append(gotTodo);
        }
    },

    createTodo: async () => {
        App.setLoading(true);
        const content = $('.newTodo').val();
        await App.contracts.dTodo.methods.createTodo(content).send({from: App.account});
        window.location.reload();
    },

    toggleCompleted: async (e) => {
        App.setLoading(true);
        todoId = Number(e.target.classList[0]);
        await App.contracts.dTodo.methods.completeTodo(todoId).send({from: App.account});
        window.location.reload();
    },

    setLoading: (boolean) => {
        App.loading = boolean;
        const loader = $('.loader');
        const content = $('.container');
        if (boolean) {
            loader.show();
            content.hide();
        } else {
            loader.hide();
            content.show();
        }
    }
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})