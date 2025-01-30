import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { Payment } from './entities/payment.entity';
import { InjectModel } from '@nestjs/sequelize';
import generateOrderId from 'src/utils/generateTransaksiId';
import { HttpService } from '@nestjs/axios';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment)
    private paymentModel: typeof Payment,
    private readonly httpService: HttpService,
  ) {}

  private async requestMidtrans(orderId: string, price: number): Promise<any> {
    const midtransUrl = process.env.MIDTRANS_URL;
    const base64ServerKey = Buffer.from(
      `${process.env.MIDTRANS_SERVER_KEY}:`,
    ).toString('base64');

    const { data } = await firstValueFrom(
      this.httpService
        .post(
          midtransUrl,
          {
            payment_type: 'bank_transfer',
            transaction_details: {
              order_id: orderId,
              gross_amount: price,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${base64ServerKey}`,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw new InternalServerErrorException(error.message);
          }),
        ),
    );
    return data;
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const transaksiId = generateOrderId();
    const midtransData = await this.requestMidtrans(
      transaksiId,
      createPaymentDto.price,
    );

    const payment = await this.paymentModel.create({
      userId: createPaymentDto.userId,
      paymentUrl: midtransData.redirect_url,
      transaksiId,
      type: createPaymentDto.type,
      status: 'pending',
      price: createPaymentDto.price,
      limit: createPaymentDto.limit,
    });

    return {
      payment,
      midtrans: midtransData.data,
    };
  }

  async findAll(userId: string) {
    const getPayments = await this.paymentModel.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });

    return getPayments;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  async update(updatePaymentDto: UpdatePaymentStatusDto) {
    const findTransaksiId = await this.paymentModel.findOne({
      where: {
        transaksiId: updatePaymentDto.order_id,
      },
    });

    if (!findTransaksiId) {
      return 'Transaksi ID not found';
    }

    if (updatePaymentDto.transaction_status === 'settlement') {
      const updateLimitUser = await this.httpService.axiosRef.put(
        'http://localhost:8081/api/user/updateLimit',
        {
          userId: findTransaksiId.userId,
          limit: findTransaksiId.limit,
        },
      );

      if (updateLimitUser.data.status !== 200) {
        throw new InternalServerErrorException('Failed to update user limit');
      }
    }

    return this.paymentModel.update(
      {
        status:
          updatePaymentDto.transaction_status === 'settlement'
            ? 'success'
            : 'pending',
      },
      {
        where: {
          transaksiId: updatePaymentDto.order_id,
        },
      },
    );
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
