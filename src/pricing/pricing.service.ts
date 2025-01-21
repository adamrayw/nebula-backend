import { Injectable } from '@nestjs/common';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';

@Injectable()
export class PricingService {
  create(createPricingDto: CreatePricingDto) {
    return 'This action adds a new pricing';
  }

  findAll() {
    const price_list = [
      {
        id: 1,
        type: 'Personal',
        descripion: 'Perfect for individual storage needs',
        price: '75000',
        features: {
          name: [
            '100GB secure storage',
            'Access on all devices',
            'End-to-end encryption',
            'Basic sharing features',
          ],
        },
      },
      {
        id: 2,
        type: 'Professional',
        descripion: 'Ideal for professionals and small teams',
        price: '195000',
        features: {
          name: [
            '1TB secure storage',
            'Priority support',
            'Team folders',
            'Smart sync',
          ],
        },
      },
      {
        id: 3,
        type: 'Business',
        descripion: 'For growing businesses with advanced needs',
        price: '450000',
        features: {
          name: [
            '5TB secure storage',
            '24/7 Priority support',
            'Admin console',
            'User management',
            'Advanced sharing features',
            'Audit and reporting',
            'API access',
          ],
        },
      },
    ];
    return price_list;
  }

  findOne(id: number) {
    return `This action returns a #${id} pricing`;
  }

  update(id: number, updatePricingDto: UpdatePricingDto) {
    return `This action updates a #${id} pricing`;
  }

  remove(id: number) {
    return `This action removes a #${id} pricing`;
  }
}
