// initialize your app
// and ...
nw.Window.open(
    "app/index.html",
    { new_instance: true, mixed_context: true },
    (win) => {},
)
