import { CategoryForm } from '@/components/expenses/CategoryForm'
import { ExpenseDetail } from '@/components/expenses/ExpenseDetail'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { FilterSheet } from '@/components/expenses/FilterSheet'
import { IncomeDetail } from '@/components/income/IncomeDetail'
import { IncomeForm } from '@/components/income/IncomeForm'
import { LogDetail } from '@/components/machines/LogDetail'
import { MachineForm } from '@/components/machines/MachineForm'
import { MachineLogForm } from '@/components/machines/MachineLogForm'
import { SiteForm } from '@/components/sites/SiteForm'
import { SiteSwitcher } from '@/components/sites/SiteSwitcher'
import { Button } from '@/components/ui/Button'
import { Sheet, SheetHeader } from '@/components/ui/Sheet'
import { VendorForm } from '@/components/vendors/VendorForm'
import { useUI, type Sheet as SheetT } from '@/context/UIContext'

function titleFor(sheet: SheetT): string {
  switch (sheet.name) {
    case 'expense':
      return sheet.expenseId ? 'Edit Expense' : 'Add Expense'
    case 'expense-detail':
      return 'Expense'
    case 'income':
      return sheet.incomeId ? 'Edit Income' : 'Add Income'
    case 'income-detail':
      return 'Income'
    case 'log':
      return sheet.logId ? 'Edit hours' : 'Log hours'
    case 'log-detail':
      return 'Hours log'
    case 'site-switcher':
      return 'Your Sites'
    case 'site-form':
      return sheet.siteId ? 'Edit Site' : 'New Site'
    case 'vendor-form':
      return sheet.vendorId ? 'Edit Vendor' : 'New Vendor'
    case 'category-form':
      return sheet.categoryId ? 'Edit Category' : 'New Category'
    case 'machine-form':
      return sheet.machineId ? 'Edit Machine' : 'New Machine'
    case 'filters':
      return 'Filters'
    case 'confirm':
      return sheet.title
  }
}

export function SheetHost() {
  const { sheets, closeSheet } = useUI()
  const top = sheets[sheets.length - 1]
  const open = !!top

  return (
    <Sheet open={open} onClose={closeSheet} title={top ? titleFor(top) : undefined} height={top?.name === 'expense' || top?.name === 'log' || top?.name === 'income' ? 'full' : 'auto'}>
      {top && (
        <>
          <SheetHeader title={titleFor(top)} onClose={top.name === 'confirm' ? undefined : closeSheet} />
          <SheetBody sheet={top} />
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
      return <ExpenseForm expenseId={sheet.expenseId} other={sheet.other} onSaved={saved} />
    case 'expense-detail':
      return <ExpenseDetail id={sheet.id} />
    case 'income':
      return <IncomeForm incomeId={sheet.incomeId} general={sheet.general} onSaved={saved} />
    case 'income-detail':
      return <IncomeDetail id={sheet.id} />
    case 'log':
      return <MachineLogForm logId={sheet.logId} machineId={sheet.machineId} onSaved={saved} />
    case 'log-detail':
      return <LogDetail id={sheet.id} />
    case 'site-switcher':
      return <SiteSwitcher />
    case 'site-form':
      return <SiteForm siteId={sheet.siteId} onSaved={saved} />
    case 'vendor-form':
      return <VendorForm vendorId={sheet.vendorId} onSaved={saved} />
    case 'category-form':
      return <CategoryForm categoryId={sheet.categoryId} type={sheet.type} onSaved={saved} />
    case 'machine-form':
      return <MachineForm machineId={sheet.machineId} onSaved={saved} />
    case 'filters':
      return <FilterSheet />
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
  }
}
