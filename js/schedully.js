async function analyzeSchedule() {
    const input = document.getElementById('scheduleInput').value;
    const outputDiv = document.getElementById('scheduleOutput');

    outputDiv.innerText = "LLM에 요청 중입니다... 잠시만 기다려주세요.";

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
            method: "POST",
            headers: {
                "Authorization": "Bearer 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",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: `문장에 포함된 일정 정보를 시간순으로 일정표 형식으로 출력해줘.
출력 형식은 반드시 아래와 같이 해:

- HH:MM 내용

문장: "${input}"`,
                parameters: {
                    max_new_tokens: 200,
                    temperature: 0.3  // 안정성 위해 낮춤
                }
            })
        });

        const result = await response.json();
        console.log(result);

        let outputText = "";

        if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
            outputText = result[0].generated_text;
        } else if (result && result.generated_text) {
            outputText = result.generated_text;
        } else {
            outputDiv.innerText = "응답 형식 오류 또는 모델 응답 없음.";
            return;
        }

        // 결과 출력
        outputDiv.innerText = outputText;

        addrScript = 'https://script.google.com/macros/s/AKfycbzpiti1L2YfO-IL76j8VAaWxQAgRAGwhkcuY20UiGaC0rxk0-xbzYvgti5ViHfjb-OK/exec';

        var finalData = JSON.stringify({
					    "id": getUVfromCookie(),
                        "time": getTimeStamp(),
					    "input": input,
					    "output": outputText
					    })

        axios.get(addrScript + '?action=insert&table=llm&data=' + finalData)
            .then(response => {
                console.log('DB 저장 결과:', response.data);
                $.fn.simplePopup({ type: "html", htmlSelector: "#popup" });
    })

    } catch (error) {
        console.error("API 호출 오류:", error);
        outputDiv.innerText = "API 호출 중 오류 발생.";
    }
}

  function getCookieValue(name) {
					const value = "; " + document.cookie;
					const parts = value.split("; " + name + "=");
					if (parts.length === 2) {
						return parts.pop().split(";").shift();
					}
				}

				// 쿠키에 값을 저장하는 함수
				function setCookieValue(name, value, days) {
					let expires = "";
					if (days) {
						const date = new Date();
						date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
						expires = "; expires=" + date.toUTCString();
					}
					document.cookie = name + "=" + (value || "") + expires + "; path=/";
				}

				function getUVfromCookie() {
					// 6자리 임의의 문자열 생성
					const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
					// 쿠키에서 기존 해시 값을 가져옴
					const existingHash = getCookieValue("user");
					// 기존 해시 값이 없으면, 새로운 해시 값을 쿠키에 저장
					if (!existingHash) {
						setCookieValue("user", hash, 180); // 쿠키 만료일은 6개월 
						return hash;
					} else {
						// 기존 해시 값이 있으면, 기존 값을 반환
						return existingHash;
					}
				}

                function getTimeStamp() {
					const date = new Date();

					const year = date.getFullYear();
					const month = date.getMonth() + 1;
					const day = date.getDate();
					const hours = date.getHours();
					const minutes = date.getMinutes();
					const seconds = date.getSeconds();

					const formattedDate = `${padValue(year)}-${padValue(month)}-${padValue(day)} ${padValue(hours)}:${padValue(minutes)}:${padValue(seconds)}`;

					return formattedDate;
				}

                  function padValue(value) {
					return (value < 10) ? "0" + value : value;
				}