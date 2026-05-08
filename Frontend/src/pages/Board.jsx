import { CardBody } from "react-bootstrap";

export function Board() {
    return (
        <div className="container">
            <h1>Проект :</h1>
            <div className="row min-vh-100">
                <div className="col d-flex flex-column align-items-center text-bg-primary">
                    Колонка 1
                    <div className="card container mb-3">
                        <div className="card-body">
                            <div className="card-title bg-info">
                                Задача 1
                            </div>
                            <div className="card-text">
                                Описание 
                            </div>
                        </div>
                    </div>
                    <div className="card container mb-3">
                        <div className="card-body">
                            <div className="card-title bg-info">
                                Задача 2
                            </div>
                            <div className="card-text">
                                Описание 
                            </div>
                        </div>
                    </div><div className="card container mb-3">
                        <div className="card-body">
                            <div className="card-title bg-info">
                                Задача 3
                            </div>
                            <div className="card-text">
                                Описание 
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col d-flex flex-column align-items-center text-bg-dark">
                    Колонка 2
                </div>
                <div className="col d-flex flex-column align-items-center text-bg-primary">
                    Колонка 3
                </div>
            </div>
        </div>
    );
}
