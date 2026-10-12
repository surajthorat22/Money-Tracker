import { CategoryForm } from '@/components/expenses/CategoryForm'
import { ExpenseDetail } from '@/components/expenses/ExpenseDetail'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { IncomeDetail } from '@/components/income/IncomeDetail'
import { IncomeForm } from '@/components/income/IncomeForm'
import { SiteForm } from '@/components/sites/SiteForm'
import { Button } from '@/components/ui/Button'
import { Sheet, SheetHeader } from '@/components/ui/Sheet'
import { VendorForm } from '@/components/vendors/VendorForm'
import { useUI, type Sheet as SheetT } from '@/context/UIContext'

function titleFor(sheet: SheetT): string {
  switch (sheet.name) {
    case 'expense':
      return sheet.expenseId ? 'Edit expense' : 'Add expense'
    case 'expense-detail':
      return 'Expense'
    case 'income':
      return sheet.incomeId ? 'Edit income' : 'Add income'
    case 'income-detail':
      return 'Income'
    case 'site-form':
      return sheet.siteId ? 'Edit site' : 'New site'
    case 'vendor-form':
      return sheet.vendorId ? 'Edit vendor' : 'New vendor'
    case 'category-form':
      return sheet.categoryId ? 'Edit category' : 'New category'
    case 'confirm':
      return sheet.title
    default:
      return 'Money Tracker'
  }
}

export function SheetHost() {
  const { sheets, closeSheet } = useUI()
  const top = sheets[sheets.length - 1]
  const open = !!top

  return (
    <Sheet open={open} onClose={closeSheet} title={top ? titleFor(top) : undefined} height="auto">
      {top && (
        <>
          <SheetHeader title={titleFor(top)} onClose={top.name === 'confirm' ? undefined : closeSheet} />
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <SheetBody sheet={top} />
          </div>
        </>
      )}
    </Sheet>
  )
}

function SheetBody({ sheet }: { sheet: SheetT }) {
  const { closeSheet } = useUI()
  const saved = () => closeSheet()

  switch (sheet.name) {
    case 'expense':
      return <ExpenseForm expenseId={sheet.expenseId} onSaved={saved} />
    case 'expense-detail':
      return <ExpenseDetail id={sheet.id} />
    case 'income':
      return <IncomeForm incomeId={sheet.incomeId} onSaved={saved} />
    case 'income-detail':
      return <IncomeDetail id={sheet.id} />
    case 'site-form':
      return <SiteForm siteId={sheet.siteId} onSaved={saved} />
    case 'vendor-form':
      return <VendorForm vendorId={sheet.vendorId} onSaved={saved} />
    case 'category-form':
      return <CategoryForm categoryId={sheet.categoryId} onSaved={saved} />
    case 'confirm':
      return (
        <div className="px-5 pb-6">
          <p className="text-[15px] text-[var(--secondary)]">{sheet.message}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={closeSheet}>
              Cancel
            </Button>
            <Button
              variant={sheet.destructive ? 'danger' : 'primary'}
              onClick={() => {
                sheet.onConfirm()
                closeSheet()
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      )
    default:
      return null
  }
}
