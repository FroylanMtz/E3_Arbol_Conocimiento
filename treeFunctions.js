function rename_node() {
    let hasDuplicated = false;

    if (node_to_rename && rename_node_modal_active) {

        name = $('#RenameNodeName').val();

        hasDuplicated = checkhasDuplicated(name, node_to_rename.id);



        if (hasDuplicated) {
            swal({
                title: "Ya existe un nodo llamado así",
                text: "¿Esta seguro que desea renombrar el nodo actual?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
                .then((willDelete) => {
                    if (willDelete) {
                        node_to_rename.name = name;
                        node_to_rename.textPosition = textPosition ? 1 : 0;
                        rename_node_modal_active = false;
                        textPosition = false;
                        saveNewName(node_to_rename)
                    }

                    closeModal();
                    outer_update(node_to_rename);
                });
        }

        if (!hasDuplicated) {
            node_to_rename.name = name;
            rename_node_modal_active = false;
            node_to_rename.textPosition = textPosition ? 1 : 0;
            textPosition = false;
            saveNewName(node_to_rename)
        }

    }

    if (!hasDuplicated) {
        closeModal();
        outer_update(node_to_rename);
    }

}


async function saveNewName(node_to_rename) {
    await axios({
        method: 'post',
        url: "http://161.35.56.15/tema/editarNodo/" + node_to_rename.id + "?id_nodo=" + node_to_rename.id + "&nombre_nodo=" + node_to_rename.name + "&textPosition=" + node_to_rename.textPosition,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
            id_nodo: node_to_rename.id,
            nombre_nodo: node_to_rename.name,
            textPosition: node_to_rename.textPosition,
        }
    }).then(function (response) {
        console.log("EDITADO")
    }).catch(function (error) {
        console.log('Error: ' + error)
    })
}

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};

function createNodesList(tree_rootAux, level, ignore) {

    if (ignore != null) {
        if (tree_rootAux['id'] == ignore['id']) {
            return
        }
        nodesToListToDelete.push({
            id: tree_rootAux['id'],
            name: tree_rootAux['name']
        });
    } else {
        nodesToList.push({
            id: tree_rootAux['id'],
            name: tree_rootAux['name']
        });
    }

    tree_rootAux['level'] = level;
    if (tree_rootAux['children'] != undefined) {
        for (var i = 0; i < tree_rootAux['children'].length; i++) {
            createNodesList(tree_rootAux['children'][i], i, ignore)
        }
    }
    if (level == 1) {
        tree_root = tree_rootAux;
    }
}

function updateNodeToList() {

    var select = document.getElementById("nodesSelect");
	var options= document.getElementById("nodesSelect").selectedIndex;
    var nodesSelectAllDelete = document.getElementById("nodesSelectAllDelete");
	var op2 = document.getElementById("nodesSelectAllDelete").selectedIndex;
		
    $('#nodesSelect').empty().trigger("change");
    $('#nodesSelectAllDelete').empty().trigger("change");
    nodesToList = [];
    createNodesList(tree_root, 1, null);
		//console.log(options)
		/*if(options!=-1)
   		$('nodesSelect').select2('data', null);
		if(op2!=-1)
    $('#nodesSelectAllDelete').select2('data', null);*/
	
    for (var i = 0; i < nodesToList.length; i++) {
        var nameNode = nodesToList[i].name;
        var idNode = nodesToList[i].id;
        var el = document.createElement("option");
        el.textContent = nameNode;
        el.value = idNode;
        //nodesSelectAllDelete.appendChild(el);
        //select.appendChild(el);
    }

}


function updateNodeToListToDelete() {

    var select = document.getElementById("nodesSelectAllDelete");
	var op = document.getElementById("nodesSelectAllDelete").selctedIndex;
    $('#nodesSelectAllDelete').empty().trigger("change");
    nodesToListToDelete = [];
    createNodesList(tree_root, 1, node_to_delete);
		console.log(op+" "+157)
		//if(op!=-1 && op != null)
    //$('#nodesSelectAllDelete').select2('data', null);
    for (var i = 0; i < nodesToListToDelete.length; i++) {
        var nameNode = nodesToListToDelete[i].name;
        var idNode = nodesToListToDelete[i].id;
        var el = document.createElement("option");
        el.textContent = nameNode;
        el.value = idNode;
        select.appendChild(el);
    }

}

function isFamily(nodeParent, nodeSon) {
    if (nodeParent['name'] == nodeSon['name']) {
        return true;
    }
    if (nodeParent['children'] != undefined) {
        for (var i = 0; i < nodeParent['children'].length; i++) {
            if (isFamily(nodeParent['children'][i], nodeSon)) {
                return true;
            }
        }
    }
    return false;
}

function createParentConection() {

    var color = document.getElementById("colorConexion").value;

    color = color.slice(1);

    outer_update(tree_root);
		var op = document.getElementById('nodesSelect').options;
		var i = document.getElementById('nodesSelect').selectedIndex;
        var nodeSelected = $('#nodesSelect').select2('data')

    var nodeSelected = op[i].value;
    var couplingParent = tree_d3.nodes(tree_root).filter(function (d) {
        return d['id'] == nodeSelected;
    })[0];

    var couplingChild = tree_d3.nodes(tree_root).filter(function (d) {
        return d['id'] === create_parent_relation['id'];
    })[0];
    let isFamily1 = false;
    if (couplingParent['level'] > couplingChild['level']) {
        isFamily1 = isFamily(couplingChild, couplingParent)
    }
    if (couplingParent.children) {
        couplingParent.children.forEach(function (d) {
            if (d.id == couplingChild.id) {
                isFamily1 = true;
            }
        });
    }
    multiParents.forEach(function (d) {
        if ((d.parent.id == couplingParent.id && d.child.id == couplingChild.id) || (d.parent.id == couplingChild.id && d.child.id == couplingParent.id)) {
            isFamily1 = true;
        }
    });
    if (!isFamily1) {
        multiParents.push({
            parent: couplingParent,
            child: couplingChild
        })
        registerParentConection(couplingParent, couplingChild, color);
        closeModal();
        outer_update(create_parent_relation);
    } else {
        alert("Son familia")
    }

}

function registerParentConection(parent, child, color) {
    axios({
        method: 'post',
        url: "http://161.35.56.15/tema/addsecundario?id_padre=" + parent.id + "&id_hijo=" + child.id + "&color=" + color,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
            id_padre: parent.id,
            id_hijo: child.id,
            color: color
        }
    }).then(function (response) {

    }).catch(function (error) {
        console.log('Error: ' + error)
    })

}

function deleteParent() {
    create_node_parent['id']
		var op = document.getElementById('deleteParentSelect').options;
		var i = document.getElementById('deleteParentSelect').selectedIndex;
		//if(op!=-1)
    //var nodeSelected = $('#deleteParentSelect').select2('data')

    var index = -1;
    for (var x = 0; x < multiParents.length; x++) {
        let child = multiParents[x].child;
        let parent = multiParents[x].parent;

        if (child['id'] == create_node_parent['id']) {
            if (parent['id'] == op[i].value) {
                deleteParentDB(child, parent)
                index = x;
                break;
            }
        }
    }
    if (index >= 0) {
        multiParents.splice(index, 1);
        closeModal();
        outer_update(tree_root);
    }
}

async function deleteParentDB(child, parent) {
    await axios({
        method: 'post',
        url: "http://161.35.56.15/tema/deleteNodoSecundario?id_hijo=" + child.id + "&id_padre=" + parent.id,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
            id_hijo: child.id,
            id_padre: parent.id
        }
    }).then(function (response) {
        console.log("funciono")
    }).catch(function (error) {
        console.log('Error: ' + error)
    })
}

function create_node() {
    name = $('#CreateNodeName').val();

    let hasDuplicated = checkhasDuplicated(name, null);

    if (hasDuplicated) {
        swal({
            title: "Ya existe un nodo llamado así",
            text: "¿Esta seguro que desea crear nuevo el nodo?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    confirmCreateNode(name)
                }

            });
    } else {
        confirmCreateNode(name)
    }
}

async function confirmCreateNode(name) {
    if (create_node_parent && create_node_modal_active) {
        if (create_node_parent._children != null) {
            create_node_parent.children = create_node_parent._children;
            create_node_parent._children = null;
        }
        if (create_node_parent.children == null) {
            create_node_parent.children = [];
        }
        //  id = generateUUID();

        //debugger;
        new_node = {
            'name': name,
            'id': 0,
            'depth': create_node_parent.depth + 1,
            'level': create_node_parent['level'] + 1,
            'level2': create_node_parent['level2'] + 1,
            'freex': create_node_parent['freex'],
            'freey': create_node_parent['freey'] + 100,
            'children': [],
            'textPosition': textPosition ? 1 : 0,
            '_children': null
        };

        textPosition = false;
        var newId = await createRequestNewNode(new_node);

        new_node['id'] = newId;
        create_node_parent.children.push(new_node);

        create_node_modal_active = false;
        $('#CreateNodeName').val('');

    }
    closeModal();
    outer_update(create_node_parent);
}


function checkhasDuplicated(name, id) {
    for (var i = 0; i < nodesToList.length; i++) {
        if ((nodesToList[i].name == name && nodesToList[i].id != id)) {
            return true;
        }
    }
    return false;
}





function visit(parent, visitFn, childrenFn) {
    if (!parent) return;

    visitFn(parent);

    var children = childrenFn(parent);
    if (children) {
        var count = children.length;
        for (var i = 0; i < count; i++) {
            visit(children[i], visitFn, childrenFn);
        }
    }
}

function makeListSons(node) {
    var nodesSelectAllDelete = document.getElementById("nodesSelectChildNewParent");
		var op = document.getElementById("nodesSelectChildNewParent").selectedIndex;

    $('#nodesSelectChildNewParent').empty().trigger("change");
		console.log(op+"Selecciona");
		//if(op!=-1)
   		//$('#nodesSelectChildNewParent').select2('data', null);

    if (node.children != null) {
        for (var i = 0; i < node.children.length; i++) {
            var nameNode = node.children[i].name;
            var idNode = node.children[i].id;
            var el = document.createElement("option");
            el.textContent = nameNode;
            el.value = idNode;
            nodesSelectChildNewParent.appendChild(el);
        }
    }
}

function delete_node(node1) {


		var op= document.getElementById('optionsDelete').options;
		var index= document.getElementById('optionsDelete').selectedIndex;
		console.log(op[index].index+" opciones")

    let deleteOption = op[index].index+1



    let permiteDelete = true;

    if (node1.children != undefined) {
        permiteDelete = false;

        if (deleteOption == 1) {
            console.log("Entra aquí");
            swal({
                title: "Este nodo tiene hijos",
                text: "¿Esta seguro que desea eliminar el nodo?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
                .then((willDelete) => {
                    if (willDelete) {
                        confirmDeleteNode(node1);
                        deleteAllSons(node1.id);
                    }
                });
        } else if (deleteOption == 2) {
            swal({
                title: "Este nodo tiene hijos",
                text: "¿Esta seguro que desea pasar los hijos al nodo abuelo?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
                .then((willDelete) => {
                    if (willDelete) {
                        let parent = node1.parent;

                        for (var i = 0; i < node1['children'].length; i++) {
                            parent.children.push(node1.children[i]);
                        }

                        node1['children'] = null;
                        deleteandcambiarPadre(node1, parent);

                        confirmDeleteNode(node1);
                        outer_update(parent);

                    }
                });
        } else if (deleteOption == 3) {
            swal({
                title: "Este nodo tiene hijos",
                text: "¿Esta seguro que desea pasar los hijos a un nodo hijo?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
                .then((willDelete) => {
                    if (willDelete) {
                        let parent = node1.parent;
                        let newChildParent = null;

                        if (node1['children'] != undefined) {
                            //debugger;
													

														//if(op2!=-1)
                            //var nodeSelectedS = $('#nodesSelectChildNewParent').select2('data');

														var index= document.getElementById('nodesSelectChildNewParent').selectedIndex;
														var op= document.getElementById('nodesSelectChildNewParent').options;										

                            newChildParent = tree_d3.nodes(tree_root).filter(function (d) {
															
                                return d['id'] == op[index].value;
															
                            })[0];

                            newChildParent['freex'] = node1['freex']
                            newChildParent['freey'] = node1['freey']
                            if (newChildParent['children'] == undefined) {
                                newChildParent['children'] = [];
                            }


                            for (var i = 1; i < node1['children'].length; i++) {
                                newChildParent.children.push(node1.children[i]);
                            }
                        }
                        parent.children.push(newChildParent)

                        node1['children'] = null;
                        hacerHijoPadre(node1, newChildParent);
                        confirmDeleteNode(node1);
                        outer_update(parent);

                    }
                });
        } else if (deleteOption == 4) {
            swal({
                title: "Este nodo tiene hijos",
                text: "¿Esta seguro que desea pasar los hijos al nodo seleccionado?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
                .then((willDelete) => {
                    if (willDelete) {
												var index= document.getElementById('nodesSelectAllDelete').selectedIndex;
												var vec= document.getElementById('nodesSelectAllDelete').options;
												
												console.log("Este es el index: "+vec[index].value);
												//if(index!=null)
													//var nodeSelectedS = $('#nodesSelectAllDelete').select2('data');
													
                       		
                        var nodeSelected = tree_d3.nodes(tree_root).filter(function (d) {
														//var index= document.getElementById('nodesSelectAllDelete').selectedIndex;
														//var vec= document.getElementById('nodesSelectAllDelete').opciones;
                            return d['id'] ==vec[index].value;
                        })[0];
												console.log("Esto es lo que retorna :"+nodeSelected)
                        if (nodeSelected['children'] == undefined) {
                            nodeSelected['children'] = [];
                        }

                        for (var i = 0; i < node1['children'].length; i++) {
                            nodeSelected.children.push(node1.children[i]);
                        }

                        node1['children'] = null;
                        deleteandcambiarPadre(node1, nodeSelected);

                        confirmDeleteNode(node1);
                        outer_update(nodeSelected);

                    }
                });
        }
    }
    if (permiteDelete) {
        deleteAllSons(node1.id);
        confirmDeleteNode(node1);
    }
}

function hacerHijoPadre(oldParent, newChildParent) {
    axios({
        method: 'post',
        url: "http://161.35.56.15/tema/hacerHijoPadre/" + oldParent.id + "?id=" + oldParent.id + "&id2=" + newChildParent.id,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
            id: oldParent.id,
            id2: newChildParent.id
        }
    }).then(function (response) {
        console.log("funciono")
    }).catch(function (error) {
        console.log('Error: ' + error)
    })
}


function cambiarPadre(nodeToChange, newParent) {
    axios({
        method: 'post',
        url: "http://161.35.56.15/tema/cambiarPadre/" + nodeToChange.id + "?id=" + nodeToChange.id + "&id2=" + newParent.id,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
            id: nodeToChange.id,
            id2: newParent.id
        }
    }).then(function (response) {
        console.log("funciono")
    }).catch(function (error) {
        console.log('Error: ' + error)
    })
}

function deleteandcambiarPadre(oldParent, newParent) {
    axios({
        method: 'post',
        url: "http://161.35.56.15/tema/deleteandcambiarPadre/" + oldParent.id + "?id=" + oldParent.id + "&id2=" + newParent.id,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
            id: oldParent.id,
            id2: newParent.id
        }
    }).then(function (response) {
        console.log("funciono")
    }).catch(function (error) {
        console.log('Error: ' + error)
    })
}



function deleteAllSons(idNode) {
    //debugger;
    axios({
        method: 'post',
        url: "http://161.35.56.15/tema/deleteTema1/" + idNode + "?id=" + idNode,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
            id: idNode
        }
    }).then(function (response) {
        console.log("funciono")
    }).catch(function (error) {
        console.log('Error: ' + error)
    })
}
function confirmDeleteNode(node1) {
    visit(tree_root, function (d) {
        if (d.children) {
            for (var child of d.children) {
                if (child == node1) {

                    d.children = _.without(d.children, child);
                    getAllNodesDeleted(node1);
                    outer_update(tree_root);
                    break;
                }
            }
        }
    },
        function (d) {
            return d.children && d.children.length > 0 ? d.children : null;
        });

    updateNodeToList();





}

function getAllNodesDeleted(node1) {
    var index = -1;
    for (var x = 0; x < multiParents.length; x++) {
        let child = multiParents[x].child;
        let parent = multiParents[x].parent;
        if (child['id'] == node1['id'] || parent['id'] == node1['id']) {
            index = x;
            break;
        }
    }

    if (index >= 0) {
        multiParents.splice(index, 1);
    }


    if (node1.children) {
        for (var x = 0; x < node1.children.length; x++) {
            getAllNodesDeleted(node1.children[x])
        }
    }
}

async function deleteNodeConfirm() {
    try {
        let result = await swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true
        });
        // SUCCESS
        return result;
    } catch (e) {
        // Fail!
        console.error(e);
    }
}


function deleteRecursiveNode(node, nodeToDelete) {
    if (node['name'] == nodeToDelete['name']) {
        return true;
    }
    if (node['children'] != undefined) {
        for (var i = 0; i < node['children'].length; i++) {
            if (deleteRecursiveNode(node['children'][i], nodeToDelete)) {
                if (node['children'][i]['name'] == nodeToDelete['name']) {
                    node.children = _.without(node.children, node['children'][i]);
                }
                return true;
            }
        }
    }
    return false;
}

async function updatePosition(draggingNode) {
    await axios({
        method: 'post',
        url: "http://161.35.56.15/tema/posicion?newx=" + draggingNode.freex + "&newy=" + draggingNode.freey + "&id=" + draggingNode.id,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
            newy: draggingNode.freey,
            newy: draggingNode.freex,
            id: draggingNode.id
        }
    }).then(function (response) {
        //console.log("funciono")
    }).catch(function (error) {
        console.log('Error: ' + error)
    })
}

async function createRequestNewNode(new_node) {

    var color = document.getElementById("colorNuevaConexion").value;

    color = color.slice(1);

    var newId;
    await axios({
        method: 'post',
        url: "http://161.35.56.15/tema/addTema?nombre_tema=" + new_node.name + "&nivel_tema=" + (create_node_parent.level2 + 1) + "&id_padre=" + create_node_parent.id +
            "&freex=" + new_node.freex + "&freey=" + new_node.freey + "&textPosition=" + new_node.textPosition + "&color=" + color,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
            nombre_tema: new_node.name,
            id_padre: create_node_parent.id,
            nivel_tema: create_node_parent.level2 + 1,
            freex: new_node.freex,
            freey: new_node.freey,
            textPosition: new_node.textPosition,
            color: color

        }
    }).then(function (response) {
        //debugger;
        newId = response['data']['newId']
    }).catch(function (error) {
        console.log('Error: ' + error)
    })
    return newId[0];

}


async function getTreeFromBD() {
    ////debugger;
    let treeData = null;
    treeExtraConections = null;
    let tree = null;

    //Consultar la base de datos
    await axios({
        method: 'get',
        url: "http://161.35.56.15/temas/arbol",
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
    }).then(function (response) {
        treeData = response['data']['treeStructure'];

        treeExtraConections = response['data']['extraParent'];
    }).catch(function (error) {
        console.log('Error: ' + error)
    });

    return treeData;
}

function createExtraConectionStructure(treeData) {
    var couplingParent = null;
    var couplingChild = null;
    treeExtraConections.forEach(function (d1) {
        couplingParent = tree_d3.nodes(treeData).filter(function (d) {
            return d['id'] == d1['id_padre'];
        })[0];
        couplingChild = tree_d3.nodes(treeData).filter(function (d) {
            return d['id'] == d1['id_hijo'];
        })[0];

        multiParents.push({
            parent: couplingParent,
            child: couplingChild,
        })
    });
}


function loadQuestions(d) {

    axios({
        method: 'get',
        url: "http://161.35.56.15/preguntas/nodo?id=" + d.id,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
    }).then(function (response) {
        
        var questions = response.data;
        $('#questionList').empty();

        questions.forEach(question => {
            $("#questionList").append('<li><p style="font-weight: bold;"> ' + question.pregunta + '</p> <p>*' + question.respuesta + '</p></li>');
        });
        if(questions.length==0){
            $("#questionList").append('<li><p style="font-weight: bold;">No hay preguntas que mostrar.</p></li>');

        }

    }).catch(function (error) {
        console.log('Error: ' + error)
    });

    $('#QuestionModal').foundation('reveal', 'open');

}

function listarNodos(d){
    let select = document.getElementById("nodesSelect");
    let nodos = [];
    let mensaje_uno = document.getElementById("mensaje_1");
    $('#nodesSelect').empty().trigger("change");
    mensaje_uno.innerHTML = "";
    axios({
        method: 'get',
        url: "http://161.35.56.15/temas/posiblesNodosPadres/" + d.level2,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
    }).then(function (response) {
        nodos = response.data[0];
        for (var i = 0; i < nodos.length; i++) {
            if (nodos[i].id == d.id) {
                nodos.splice(i, 1)
            }
        }
        axios({
            method: 'get',
            url: "http://161.35.56.15/temas/obtenerPadres/" + d.id,
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
        }).then(function (response) {
            let padres = response.data[0];
            for(var j = 0; j < padres.length; j++){
                for (var i = 0; i < nodos.length; i++) {
                    if (nodos[i].id == padres[j].id_padre) {
                        nodos.splice(i, 1)
                    }
                }
            }
            for (var i = 0; i < nodos.length; i++) {
                var el = document.createElement("option");
                el.textContent = nodos[i].nombre_tema;
                el.value = nodos[i].id;
                select.appendChild(el);
            }
            if( nodos.length == 0 ){
                mensaje_uno.innerHTML = "Ya no hay nodos candidatos a ser padre";
            }
        }).catch(function (error) {
            console.log('Error: ' + error)
        });
    }).catch(function (error) {
        console.log('Error: ' + error)
    });
}

async  function obtenerColoresRelaciones(){

    let respuesta = [];
    let relaciones_primarias = [];
    let relaciones_secundarias = [];
    await axios({
        method: 'get',
        url: "http://161.35.56.15/tema/relacionesPrimarias",
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
    }).then(function (response) {

        for(var i=0; i < response['data'].length; i++ ){
            if( response['data'][i].tipo == "primarias" ){
                relaciones_primarias.push(response['data'][i]);
            }else{
                relaciones_secundarias.push(response['data'][i]);
            }
        }

        respuesta.relacionesPrimarias = relaciones_primarias;
        respuesta.relacionesSecundarias = relaciones_secundarias;

    }).catch(function (error) {
        console.log('Error: ' + error)
    });


    return respuesta;
}

async function click_conexion(d){
    $('#CambiarColorConexion').foundation('reveal', 'open');
    document.getElementById("idConexion").value = d.padre + "-" + d.hijo;

    /*$('#CambiarColorConexion').foundation('reveal', 'open');
    console.log("id " + d.source.id + "-" + d.target.id);
    document.getElementById("idConexion").value = "id " + d.source.id + "-" + d.target.id;*/
    //console.log(d);
}

async function guardarNuevoColor(){
    var nuevo_color = document.getElementById("colorConexionNvo").value;
    var id_conexion = document.getElementById("idConexion").value;

    nuevo_color = nuevo_color.slice(1);

    console.log(nuevo_color);
    console.log("Id conexion: " + document.getElementById("idConexion").value);

    await axios({
        method: 'post',
        url: "http://161.35.56.15/tema/actualizarColor?id=" + id_conexion + "&color=" + nuevo_color,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
            id: id_conexion,
            color: nuevo_color
        }
    }).then(function (response) {
        //debugger;
        
        console.log(response);
        outer_update(tree_root);
        closeModal();

    }).catch(function (error) {
        console.log('Error: ' + error)
    })

}