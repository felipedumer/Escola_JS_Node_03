var express = require('express');
var router = express.Router();
const noteModel = require('../models/note');
const withAuth = require('../middlewares/auth');

const isOwner = (user, note) => {
    if(JSON.stringify(user._id) == JSON.stringify(note.author._id)) {
        return true;
    } else {
        return false;
    }
}

router.post('/', withAuth, async (req, res) => {
    console.log('title');
    const { title, body } = req.body;
    
    try {
        let note = new noteModel({ title: title, body: body, author: req.user._id });
        await note.save();
        res.json(note);
    } catch (e) {
            res.status(204).json({error: e});
    }
});

router.get('/search', withAuth, async(req, res) => {
    const { query } = req.query;
    console.log(query);
    try {
        let notes = await noteModel
        .find({ author: req.user._id })
        .find({ $text: {$search: query }});
        res.json(notes);
    } catch (e) {
        res.json({error: e}).status(204);
    }
});

router.get('/:id', withAuth, async (req, res) => {
    try {
        const { id } = req.params;
        let note = await noteModel.findById(id);
        if(isOwner(req.user, note)) {
            res.json(note);
        } else {
            res.status(203).json({error: 'Permission denied'});
        }
    } catch (e) {
        res.status(204).json({error: e});
    }
});



router.get('/', withAuth, async(req, res) => {
    try {
        let notes = await noteModel.find({author: req.user._id});
        res.json(notes);
    }
    catch (e) {
        res.json({error: e}).status(204);
    }
});



router.put('/:id', withAuth, async(req, res) => {
    const { title, body } = req.body;
    const { id } = req.params;

    try {
        let note = await noteModel.findById(id);
        console.log(id);
        if(isOwner(req.user, note)) {
            let note = await noteModel.findByIdAndUpdate(id,
            { $set: {title: title, body: body} },
            { upsert: true, 'new': true }
            );

            res.json(note);
        } else {
            res.status(403).json({error: 'Permission denied'});
        }
    } catch (e) {
        res.status(500).json({error: e});
    }
});



router.delete('/:id', withAuth, async (req, res) => {
    const { id } = req.params;
    try {
        let note = await noteModel.findById(id);
        if(isOwner(req.user, note)) {
            await note.delete();
            res.json({message: 'OK', desc: note}).status(204);
        } else {
            res.status(403).json({error: 'Permission denied'});
        }
    } catch (e) {
        res.status(500).json({error: e});
    }
})

module.exports = router;