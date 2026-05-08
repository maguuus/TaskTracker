export function Login() {
    return (
        <div className="container mt-4">
            <form>
                <h1>Войдите в аккаунт:</h1>
                <div className="my-3">
                    <label className="from-label">Email:</label>
                    <input className="form-control" id="email" placeholder="Enter email"></input>
                </div>
                <div class="mb-3">
                    <label className="form-label">Password:</label>
                    <input className="form-control" id="pwd" placeholder="Enter password"></input>
                </div>
            </form>
        </div>
    );
}
