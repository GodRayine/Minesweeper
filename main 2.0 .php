<?php session_start(); ?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gordry mini games</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }

        body {
            min-height: 100vh;
            background: #f0f0f0;
            display: flex;
            flex-direction: column;
        }

        /* Шапка сайта */
        .header {
            background: #2c3e50;
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .site-title {
            font-size: 24px;
        }

        .login-btn {
            padding: 10px 20px;
            background: #3498db;
            border: none;
            color: white;
            cursor: pointer;
            border-radius: 5px;
            transition: background 0.3s;
        }

        .login-btn:hover {
            background: #2980b9;
        }

        /* Основной контент */
        .main-content {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        /* Контейнер для карточек */
        .cards-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            max-width: 1200px;
            justify-content: center;
        }

        /* Стили для карточки */
        .card {
            width: 250px;
            height: 300px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: transform 0.3s;
            text-decoration: none;
            color: #333;
            display: flex;
            flex-direction: column;
        }

        .card:hover {
            transform: translateY(-10px);
        }

        .card-image {
            width: 100%;
            height: 150px;
            background: #ddd; /* Замените на свою картинку */
            object-fit: cover;

        }

        .card-content {
            padding: 15px;
            text-align: center;
        }

        .card-title {
            font-size: 20px;
            margin-bottom: 10px;
        }

        .card-description {
            font-size: 14px;
            color: #666;
        }
        /* Модальное окно */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5); /* Затемнение фона */
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .modal-content {
            background: white;
            padding: 20px;
            border-radius: 10px;
            width: 300px;
            position: relative;
            animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
            from {
                transform: translateY(-100px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .close-btn {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 24px;
            cursor: pointer;
            color: #333;
        }

        .close-btn:hover {
            color: #e74c3c;
        }

        .modal-content h2 {
            text-align: center;
            margin-bottom: 20px;
        }

        .modal-content form {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .modal-content label {
            font-size: 14px;
        }

        .modal-content input {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }

        .submit-btn {
            padding: 10px;
            background: #3498db;
            border: none;
            color: white;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
        }

        .submit-btn:hover {
            background: #2980b9;
        }
        .user-menu {
            position: relative;
            display: inline-block;
        }

        .username {
            padding: 10px 20px;
            color: white;
            cursor: pointer;
        }

        .dropdown {
            display: none;
            position: absolute;
            right: 0;
            background: #3498db;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .user-menu:hover .dropdown {
            display: block;
        }

        .logout-btn {
            display: block;
            padding: 10px 20px;
            color: white;
            text-decoration: none;
            transition: background 0.3s;
        }

        .logout-btn:hover {
            background: #2980b9;
        }
    </style>
</head>
<body>
    <!-- Шапка -->
    <header class="header">
        <?php
        if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
            $username = htmlspecialchars($_SESSION['username']);
            echo '<div class="site-title">Название сайта</div>';
            echo '<div class="user-menu">';
            echo '<span class="username">' . $username . '</span>';
            echo '<div class="dropdown">';
            echo '<a href="logout.php" class="logout-btn">Выход</a>';
            echo '</div>';
            echo '</div>';
        } else {
            echo '<div class="site-title">Название сайта</div>';
            echo '<button class="login-btn" onclick="openModal()">Вход</button>';
        }
        ?>
    </header>

    <!-- Основной контент -->
    <main class="main-content">
        <div class="cards-container">
            <!-- Пример карточки -->
            <a href="https://gordry.ru/minesweeper/" class="card">
                <img src="minesweeper_img.jpg" class="card-image">
                <div class="card-content">
                    <h2 class="card-title">MineSweeper</h2>
                    <p class="card-description">Мини игра в сапёра от Gordry и Grok</p>
                </div>
            </a>

            <a href="https://gordry.ru/tetris" class="card">
                <img src="tetris_img.jpg" class="card-image">
                <div class="card-content">
                    <h2 class="card-title">Tetris</h2>
                    <p class="card-description">Мини игра в тетрис от Gordry и Grok</p>
                </div>
            </a>

            <a href="https://gordry.ru/tic_tag_toe" class="card">
                <img src="tic_tag_toe_img.jpg" class="card-image">
                <div class="card-content">
                    <h2 class="card-title">Tic tag toe</h2>
                    <p class="card-description">Мини игра в крестики нолики от Gordry и Grok</p>
                </div>
            </a>

            <a href="https://gordry.ru/chess" class="card">
                <img src=" " class="card-image">
                <div class="card-content">
                    <h2 class="card-title">Chess</h2>
                    <p class="card-description">Мини игра в шахматы от Gordry и Grok</p>
                </div>
            </a>

            <!-- Сюда можно добавлять новые карточки -->
        </div>
    </main>
    <!-- Модальное окно авторизации -->
    <div class="modal" id="loginModal">
        <div class="modal-content">
            <span class="close-btn" onclick="closeModal()">&times;</span>
            <h2>Вход</h2>
            <form>
                <label for="username">Логин:</label>
                <input type="text" id="username" name="username" required>
                <label for="password">Пароль:</label>
                <input type="password" id="password" name="password" required>
                <button type="submit" class="submit-btn">Войти</button>
            </form>
        </div>
    </div>
    <script>
        function openModal() {
            document.getElementById('loginModal').style.display = 'flex';
        }
    
        function closeModal() {
            document.getElementById('loginModal').style.display = 'none';
        }
    
        window.onclick = function(event) {
            const modal = document.getElementById('loginModal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }
    
        // Обработка отправки формы
        document.querySelector('.modal-content form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            fetch('api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    closeModal();
                    // Перезагрузка страницы для отображения имени пользователя
                    window.location.reload();
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error('Ошибка:', error));
        });
    </script>
</body>
</html>