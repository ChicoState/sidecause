// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FilterPopover } from '../../app/posts/FilterPopover'
import { defaultPostFilters } from '../../app/posts/post-filters'

afterEach(cleanup)

describe('FilterPopover', () => {
  it('opens the filter panel and exposes labeled controls', () => {
    render(
      <FilterPopover
        filters={defaultPostFilters}
        onApplyFilters={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))

    expect(screen.getByRole('dialog', { name: 'Filter posts' })).toBeTruthy()
    expect(screen.getByLabelText('Location')).toBeTruthy()
    expect(screen.getByLabelText('Search posts')).toBeTruthy()
    expect(screen.getByLabelText('Availability')).toBeTruthy()
    expect(screen.getByLabelText('Sort posts by')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Apply filters' })).toBeTruthy()
  })

  it('closes after applying filters', () => {
    render(
      <FilterPopover
        filters={defaultPostFilters}
        onApplyFilters={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }))

    expect(screen.queryByRole('dialog', { name: 'Filter posts' })).toBeNull()
  })

  it('passes a typed minimum availability to the filters', () => {
    const onApplyFilters = vi.fn()
    render(
      <FilterPopover
        filters={defaultPostFilters}
        onApplyFilters={onApplyFilters}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.change(screen.getByLabelText('Availability'), {
      target: { value: '4' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }))

    expect(onApplyFilters).toHaveBeenCalledWith({
      ...defaultPostFilters,
      availability: 4,
    })
  })

  it('passes the search query to the filters', () => {
    const onApplyFilters = vi.fn()
    render(
      <FilterPopover
        filters={defaultPostFilters}
        onApplyFilters={onApplyFilters}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.change(screen.getByLabelText('Search posts'), {
      target: { value: '  Park  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }))

    expect(onApplyFilters).toHaveBeenCalledWith({
      ...defaultPostFilters,
      search: 'Park',
    })
  })
})
