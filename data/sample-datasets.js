export const SampleDatasets = [
  {
    name: 'Dataset A',
    providers: [
      {
        name: 'Provider A',
        url: 'https://www.provider-a.com',
      },
    ],
    description: 'This is Dataset A.',
    thumbnail: null,
    tags: ['tag1', 'tag2', 'tag3'],
    coverage: {
      temporal_coverage_start_date: '2022-01-01',
      temporal_coverage_end_date: '2022-12-31',
      geo_spatial_coverage: 'Global',
    },
    maintainers: [
      {
        name: 'Maintainer A',
        github_username: 'maintainer-a',
      },
    ],
    license: {
      name: 'MIT License',
      url: 'https://opensource.org/licenses/MIT',
    },
    links: [
      {
        title: 'Link A',
        url: 'https://www.link-a.com',
      },
    ],
    doi_citation: 'https://doi.org/10.1234/dataset-a',
    expected_update_frequency: 'Daily',
    demo: true,
  },
  {
    name: 'Dataset B',
    providers: [
      {
        name: 'Provider B',
        url: 'https://www.provider-b.com',
      },
    ],
    description: 'This is Dataset B.',
    thumbnail: null,
    tags: ['tag2', 'tag3'],
    coverage: null,
    maintainers: [
      {
        name: 'Maintainer A',
        github_username: 'maintainer-a',
      },
      {
        name: 'Maintainer B',
        github_username: 'maintainer-b',
      },
    ],
    license: {
      name: 'MIT License',
      url: 'https://opensource.org/licenses/MIT',
    },
    links: [
      {
        title: 'Link B',
        url: 'https://www.link-b.com',
      },
    ],
    doi_citation: null,
    expected_update_frequency: null,
    demo: false,
  },
]
