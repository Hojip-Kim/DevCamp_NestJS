## **📌 DevCamp - BackEnd(TypeScript + NestJS)**


### 1주차 - NestJS 기반 회원가입&로그인 구현
- 회원가입
- 로그인
- 배포
### 2주차 - 결제
- 쿠폰
- 포인트
- PG사 연결
- 배포
### 사용 기술: TypeScript | NestJS | PostgreSQL

---
## **📌 Directory Structure**

    📦DevCamp_NestJS
     ┃  ┣ 📂src
     ┃  ┃ ┣ 📂auth
     ┃  ┃ ┣ 📂common
     ┃  ┃ ┣ 📂decorators
     ┃  ┃ ┣ 📂exception
     ┃  ┃ ┣ 📂user
     ┃  ┃ ┣ 📜app.controller.ts
     ┃  ┃ ┣ 📜app.module.ts
     ┃  ┃ ┣ 📜app.service.ts
     ┃  ┃ ┗ 📜main.ts
     ┃  ┣ 📂test
     ┃  ┃ ┣ 📜app.e2e-spec.ts
     ┃  ┃ ┗ 📜jest-e2e.json
     ┣ 📜.eslintrc.js
     ┣ 📜.gitignore
     ┣ 📜.prettierrc
     ┣ 📜README.md
     ┣ 📜nest-cli.json
     ┣ 📜package-lock.json
     ┣ 📜package.json
     ┣ 📜tsconfig.build.json
     ┗ 📜tsconfig.json

---

## **📌Payment Module**

## **Code Structure**

### Product (제품)
- **속성:**
  - `id`: 제품 ID
  - `name`: 제품 이름
  - `price`: 제품 가격
  - `description`: 제품 설명
  - `stock`: 제품 재고

### Order (주문)
- **속성:**
  - `id`: 주문 ID
  - `customerId`: 주문 고객 ID
  - `status`: 주문의 현재상태
  - `orderDate`: 주문 날짜
  - `totalAmount`: 주문 총액
  - `items`: 주문 항목 리스트 (`Order-Item[]`)
  - `shippingInfo`: 배송 정보 (`Shipping-Info`)
  - `appliedCoupons`: 적용된 쿠폰 리스트 (`Issued Coupon[]`)
- **메소드:**
  - `calculateTotalAmount()`: 적용된 쿠폰, 포인트를 기반으로 총액 계산
  - `applyCoupon(couponId: number)`: 쿠폰 주문에 적용
  - `addOrderItem(productId: number, quantity: number)`: 주문항목 추가
  - `removeOrderItem(orderItemId: number)`: 주문항목 제거

### Order-Item (주문 항목)
- **속성:**
  - `id`: 주문 항목 식별자
  - `orderId`: 주문 ID
  - `productId`: 제품 ID
  - `quantity`: 제품 수량
  - `price`: 제품 가격

### Coupon (쿠폰)
- **속성:**
  - `id`: 쿠폰 ID
  - `type`: 쿠폰 유형
  - `discountAmount`: 할인 금액
  - `expiryDate`: 쿠폰 만료일
- **메소드:**
  - `validateCoupon()`: 쿠폰 유효성 검사

### Issued Coupon (발행된 쿠폰)
- **속성:**
  - `id`: Issued 쿠폰 ID
  - `couponId`: 쿠폰 ID
  - `userId`: 사용자 ID
  - `isUsed`: 쿠폰 사용여부
  - `usedOnOrderId`: 쿠폰이 사용된 Order ID
- **메소드:**
  - `useCoupon(orderId: number)`: 주문에 쿠폰 사용

### Point-Log (포인트 로그)
- **속성:**
  - `id`: 포인트 로그 ID
  - `userId`: 사용자 ID
  - `changeAmount`: 포인트 변동되는 양
  - `reason`: 포인트 변동된 이유
  - `changeDate`: 포인트 변동 날짜

### Shipping-Info (배송 정보)
- **속성:**
  - `id`: 배송 정보 ID
  - `orderId`: 주문 ID
  - `recipientName`: 수령인 이름
  - `address`: 배송 주소
  - `status`: 배송 상태
- **메소드:**
  - `updateShippingStatus(status: string)`: 배송 상태 업데이트

---

## **DB - Diagram**
     
<center><img width="600" alt="스크린샷 2024-03-26 오전 7 17 40" src="https://github.com/Hojip-Kim/DevCamp_NestJS/assets/101489057/2537ddc1-f53a-4616-8709-d28c105ee7e8"></center>

---

## 결제 결과
<img width="880" alt="스크린샷 2024-03-29 오전 1 51 56" src="https://github.com/Hojip-Kim/DevCamp_NestJS/assets/101489057/de80c5a2-a68f-4da1-a233-b86d551c4a07">
