// handler/cli.go
// ชั้นนอกสุด รับคำสั่งจากผู้ใช้ผ่าน Terminal
// รู้จักแค่ Use Case ไม่รู้จัก Repository หรือ Domain โดยตรง

package handler

import (
	"bufio"
	"coffee-shop/usecase"
	"fmt"
	"os"
	"strconv"
	"strings"
)

// Color Codes
const (
	colorReset  = "\033[0m"
	colorRed    = "\033[31m"
	colorGreen  = "\033[32m"
	colorYellow = "\033[33m"
	colorBlue   = "\033[34m"
	colorPurple = "\033[35m"
	colorCyan   = "\033[36m"
	colorBold   = "\033[1m"
)

// CLI Handler

// CLIHandler รับคำสั่งจาก Terminal แล้วส่งต่อให้ Use Case
type CLIHandler struct {
	orderUC *usecase.OrderUseCase
	scanner *bufio.Scanner
}

// NewCLIHandler สร้าง handler ใหม่
func NewCLIHandler(orderUC *usecase.OrderUseCase) *CLIHandler {
	return &CLIHandler{
		orderUC: orderUC,
		scanner: bufio.NewScanner(os.Stdin),
	}
}

// Run เริ่มโปรแกรม วนลูปรับคำสั่งจนกว่าจะออก
func (h *CLIHandler) Run() {
	h.printBanner()

	for {
		h.printMainMenu()
		choice := h.readLine(colorBold + ">> เลือก: " + colorReset)

		switch strings.TrimSpace(choice) {
		case "1":
			h.handleShowMenu()
		case "2":
			h.handlePlaceOrder()
		case "3":
			h.handleShowOrders()
		case "4":
			h.handleSummary()
		case "5":
			fmt.Println()
			fmt.Println(colorGreen + "╔══════════════════════════════════╗")
			fmt.Println("║  ขอบคุณที่ใช้บริการ!          ║")
			fmt.Println("║  แล้วพบกันใหม่นะ~ (─‿‿─)        ║")
			fmt.Println("╚══════════════════════════════════╝" + colorReset)
			fmt.Println()
			return
		default:
			fmt.Println(colorRed + "ไม่มีตัวเลือกนี้ ลองใหม่นะ!" + colorReset)
		}
	}
}

// ==================== UI Helpers ====================

func (h *CLIHandler) printBanner() {
	fmt.Println()
	fmt.Println(colorCyan + colorBold + "╔══════════════════════════════════════════╗")
	fmt.Println("║       ร้านกาแฟ Go Master  ☕         ║")
	fmt.Println("║    สร้างด้วย Clean Architecture + OOP   ║")
	fmt.Println("╚══════════════════════════════════════════╝" + colorReset)
	fmt.Println()
	fmt.Println(colorYellow + "  โครงสร้าง Clean Architecture:" + colorReset)
	fmt.Println("  Handler → UseCase → Repository → Domain")
	fmt.Println()
}

func (h *CLIHandler) printMainMenu() {
	fmt.Println(colorBlue + "┌─────────────────────────────┐")
	fmt.Println("│         เมนูหลัก            │")
	fmt.Println("├─────────────────────────────┤")
	fmt.Println("│  1. ดูเมนูกาแฟ           │")
	fmt.Println("│  2. สั่งกาแฟ             │")
	fmt.Println("│  3. ดูออเดอร์ทั้งหมด     │")
	fmt.Println("│  4. ดูสรุปยอดขาย         │")
	fmt.Println("│  5. ออกจากร้าน           │")
	fmt.Println("└─────────────────────────────┘" + colorReset)
}

// ==================== Menu Screen ====================

func (h *CLIHandler) handleShowMenu() {
	coffees, err := h.orderUC.GetMenu()
	if err != nil {
		fmt.Println(colorRed + "เกิดข้อผิดพลาด: " + err.Error() + colorReset)
		return
	}

	fmt.Println()
	fmt.Println(colorYellow + colorBold + "╔═════════════════════════════════════════╗")
	fmt.Println("║            เมนูวันนี้               ║")
	fmt.Println("╠══════╦══════════════════════╦══════════╣")
	fmt.Println("║  ID  ║      ชื่อเมนู        ║  ราคา    ║")
	fmt.Println("╠══════╬══════════════════════╬══════════╣" + colorReset)

	for _, c := range coffees {
		fmt.Printf("  [%s]  %s %-20s  %.0f บาท\n",
			c.ID, c.Emoji, c.Name, c.Price)
	}

	fmt.Println(colorYellow + "╚══════╩══════════════════════╩══════════╝" + colorReset)
	fmt.Println()
}

// ==================== Order Screen ====================

func (h *CLIHandler) handlePlaceOrder() {
	fmt.Println()
	fmt.Println(colorGreen + "สั่งกาแฟ" + colorReset)
	fmt.Println("(พิมพ์ 'done' เมื่อเลือกครบแล้ว, 'menu' เพื่อดูเมนู)")
	fmt.Println()

	var items []usecase.OrderItemRequest

	for {
		coffeeID := h.readLine("  ID เมนูที่ต้องการ ('done' เพื่อจบ): ")

		if strings.ToLower(coffeeID) == "done" {
			break
		}
		if strings.ToLower(coffeeID) == "menu" {
			h.handleShowMenu()
			continue
		}
		if coffeeID == "" {
			continue
		}

		qtyStr := h.readLine("  จำนวน (แก้ว): ")
		qty, err := strconv.Atoi(strings.TrimSpace(qtyStr))
		if err != nil || qty <= 0 {
			fmt.Println(colorRed + "  จำนวนไม่ถูกต้อง ต้องเป็นตัวเลขมากกว่า 0!" + colorReset)
			continue
		}

		items = append(items, usecase.OrderItemRequest{
			CoffeeID: strings.TrimSpace(coffeeID),
			Quantity: qty,
		})
		fmt.Println(colorGreen + "  เพิ่มลงตะกร้าแล้ว!" + colorReset)
	}

	if len(items) == 0 {
		fmt.Println(colorRed + "ไม่ได้เลือกอะไรเลย ยกเลิกออเดอร์" + colorReset)
		fmt.Println()
		return
	}

	// ส่ง request ไปให้ Use Case ตัดสินใจ
	order, err := h.orderUC.PlaceOrder(usecase.OrderRequest{Items: items})
	if err != nil {
		fmt.Println(colorRed + "สั่งไม่สำเร็จ: " + err.Error() + colorReset)
		fmt.Println()
		return
	}

	// แสดง receipt
	fmt.Println()
	fmt.Println(colorGreen + colorBold + "╔══════════════════════════════════════════╗")
	fmt.Printf("║  ออเดอร์ %s สำเร็จแล้ว!             ║\n", order.ID)
	fmt.Println("╠══════════════════════════════════════════╣")
	fmt.Println("║  รายการที่สั่ง:                          ║" + colorReset)

	for _, item := range order.Items {
		subtotal := item.Coffee.Price * float64(item.Quantity)
		fmt.Printf("   %s %-18s x%d = %.0f บาท\n",
			item.Coffee.Emoji, item.Coffee.Name,
			item.Quantity, subtotal)
	}

	fmt.Println(colorGreen + "╠══════════════════════════════════════════╣")
	fmt.Printf("║  ยอดรวม: %-30.0f ║\n", order.Total)
	fmt.Printf("║  สถานะ: %-31s║\n", order.Status)
	fmt.Println("╚══════════════════════════════════════════╝" + colorReset)
	fmt.Println()
}

// ==================== Orders List Screen ====================

func (h *CLIHandler) handleShowOrders() {
	orders, err := h.orderUC.GetAllOrders()
	if err != nil {
		fmt.Println(colorRed + "เกิดข้อผิดพลาด: " + err.Error() + colorReset)
		return
	}

	fmt.Println()
	if len(orders) == 0 {
		fmt.Println(colorYellow + "ยังไม่มีออเดอร์เลย! ลองสั่งกาแฟก่อนนะ" + colorReset)
		fmt.Println()
		return
	}

	fmt.Printf(colorBlue+colorBold+"ออเดอร์ทั้งหมด (%d รายการ)\n"+colorReset, len(orders))
	fmt.Println(strings.Repeat("─", 55))

	for i, o := range orders {
		fmt.Printf("%d. %s%s%s | %d แก้ว | %s%.0f บาท%s | %s\n",
			i+1,
			colorBold, o.ID, colorReset,
			o.ItemCount(),
			colorGreen, o.Total, colorReset,
			o.Status)

		// แสดงรายการในออเดอร์
		for _, item := range o.Items {
			fmt.Printf("     %s %s x%d\n",
				item.Coffee.Emoji, item.Coffee.Name, item.Quantity)
		}
	}

	fmt.Println(strings.Repeat("─", 55))
	fmt.Println()
}

// ==================== Summary Screen ====================

func (h *CLIHandler) handleSummary() {
	totalOrders, totalRevenue, err := h.orderUC.GetOrderSummary()
	if err != nil {
		fmt.Println(colorRed + "เกิดข้อผิดพลาด: " + err.Error() + colorReset)
		return
	}

	fmt.Println()
	fmt.Println(colorPurple + colorBold + "╔══════════════════════════════════╗")
	fmt.Println("║       สรุปยอดขายวันนี้      ║")
	fmt.Println("╠══════════════════════════════════╣" + colorReset)
	fmt.Printf(colorPurple+"║  ออเดอร์ทั้งหมด: %-11d ║\n", totalOrders)
	fmt.Printf("║  รายได้รวม:     %-8.0f บาท ║\n", totalRevenue)
	fmt.Println("╚══════════════════════════════════╝" + colorReset)
	fmt.Println()
}

// ==================== Input Helper ====================

func (h *CLIHandler) readLine(prompt string) string {
	fmt.Print(prompt)
	h.scanner.Scan()
	return strings.TrimSpace(h.scanner.Text())
}